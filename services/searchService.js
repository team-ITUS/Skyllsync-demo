const { BatchModel } = require("../models/batchModel");

// Reusable Search Service
// Student Filter: certificateId (via IssuedCertificates), batchName, courseName, branchName, startDate, endDate
// Pagination: page, limit
// Sorting: sortBy, sortOrder (default by batch startDate desc)

/**
 * Build a case-insensitive regex for partial matches.
 */
function iRegex(str) {
	if (!str && str !== 0) return undefined;
	const s = String(str).trim();
	if (!s) return undefined;
	return { $regex: s, $options: "i" };
}

/**
 * Parses ISO date or yyyy-mm-dd and returns Date or undefined.
 */
function parseDate(d) {
	if (!d) return undefined;
	const dt = new Date(d);
	return isNaN(dt.getTime()) ? undefined : dt;
}

/**
 * searchStudents
 * Inputs:
 *  filters: {
 *    certificateId?, batchName?, courseName?, branchName?, startDate?, endDate?
 *  }
 *  options: { page?, limit?, sortBy?, sortOrder? }
 * Output:
 *  { items, totalCount, page, limit, appliedFilters }
 */
async function searchStudents(filters = {}, options = {}) {
	const {
		certificateId,
		batchName,
		courseName,
		branchName,
		startDate,
		endDate,
	} = filters;

	const page = Math.max(parseInt(options.page || 1, 10), 1);
	const limit = Math.max(parseInt(options.limit || 20, 10), 1);
	const sortBy = options.sortBy || "batchStartDate"; // internal computed field
	const sortOrder = (options.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

	// Build batch-level match
	const match = {};
	if (batchName) match.batchName = iRegex(batchName);
	if (courseName) match.courseName = iRegex(courseName);
	if (branchName) match.branch = iRegex(branchName);

	const sd = parseDate(startDate);
	const ed = parseDate(endDate);
	if (sd || ed) {
		// Per confirmation: select batches where startDate >= startDateFilter AND endDate <= endDateFilter
		if (sd) match.startDate = Object.assign({}, match.startDate, { $gte: sd });
		if (ed) match.endDate = Object.assign({}, match.endDate, { $lte: ed });
	}

	// Build aggregation
	const pipeline = [];

	if (Object.keys(match).length) pipeline.push({ $match: match });

	// Project key batch fields and create an internal sort field
	pipeline.push({
		$project: {
			batchId: 1,
			batchName: 1,
			courseId: 1,
			courseName: 1,
			branch: 1,
			branchId: 1,
			startDate: 1,
			endDate: 1,
			studentIds: 1,
			batchStartDate: "$startDate",
		},
	});

	// Join issued certificates per batch
	pipeline.push({
		$lookup: {
			from: "issuedcertificates",
			localField: "batchId",
			foreignField: "batchId",
			as: "issued",
		},
	});

	// Build student pool (either by certificate match or all batch studentIds)
	const hasCertFilter = typeof certificateId === "string" && certificateId.trim().length > 0;
	pipeline.push({
		$addFields: {
			matchedStudentIds: hasCertFilter
				? {
						$map: {
							input: {
								$filter: {
									input: { $ifNull: [{ $first: "$issued.studList" }, []] },
									as: "s",
									cond: {
										$regexMatch: {
											input: "$$s.certificateId",
											regex: certificateId,
											options: "i",
										},
									},
								},
							},
							as: "m",
							in: "$$m.studentId",
						},
					}
				: "$studentIds",
		},
	});

	// Explode to one document per student
	pipeline.push({ $unwind: { path: "$matchedStudentIds", preserveNullAndEmptyArrays: false } });
	pipeline.push({ $addFields: { studentId: "$matchedStudentIds" } });

	// Lookup student profile
	pipeline.push({
		$lookup: {
			from: "studentregisters",
			localField: "studentId",
			foreignField: "studentId",
			as: "student",
		},
	});
	pipeline.push({ $unwind: { path: "$student", preserveNullAndEmptyArrays: false } });

	// Lookup enrollment for this batch's course
	pipeline.push({
		$lookup: {
			from: "enrolledstudents",
			let: { sid: "$studentId", cid: "$courseId" },
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ["$studentId", "$$sid"] },
								{ $eq: ["$enrolledCourseId", "$$cid"] },
							],
						},
					},
				},
				{ $limit: 1 },
			],
			as: "enrolled",
		},
	});
	pipeline.push({ $unwind: { path: "$enrolled", preserveNullAndEmptyArrays: true } });

	// Derive certificateId for each student (if exists)
	pipeline.push({
		$addFields: {
			certificateId: {
				$let: {
					vars: {
						entry: {
							$arrayElemAt: [
								{
									$filter: {
										input: { $ifNull: [{ $first: "$issued.studList" }, []] },
										as: "s",
										cond: { $eq: ["$$s.studentId", "$studentId"] },
									},
								},
								0,
							],
						},
					},
					in: "$$entry.certificateId",
				},
			},
		},
	});

	// Apply sorting (internal fields)
	const sortStage = {};
	// Map allowed sort fields to pipeline fields
	const sortFieldMap = {
		batchStartDate: "batchStartDate",
		startDate: "batchStartDate",
		endDate: "endDate",
		name: "student.name",
		enrolledDate: "enrolled.enrolledDate",
		progress: "enrolled.progress",
	};
	sortStage[sortFieldMap[sortBy] || "batchStartDate"] = sortOrder;
	pipeline.push({ $sort: sortStage });

	// Build final shape matching the Allstudents table fields
	const projectFields = {
		_id: 0,
		studentId: 1,
		name: "$student.name",
		nickname: "$student.nickname",
		dob: "$student.dob",
		gender: "$student.gender",
		email: "$student.email",
		mobile: "$student.mobile",
		enrolledCourseId: "$enrolled.enrolledCourseId",
		enrolledCourse: "$enrolled.enrolledCourse",
		paymentStatus: "$enrolled.paymentStatus",
		completeStatus: "$enrolled.completeStatus",
		isIssued: "$enrolled.isIssued",
		progress: "$enrolled.progress",
		enrolledDate: "$enrolled.enrolledDate",
		isInBatch: "$enrolled.isInBatch",
		// Hide internal fields but keep available if needed by UI later
		// batchId, batchName, branch, courseName, dates, certificateId can be added if required
	};

	pipeline.push({
		$facet: {
			items: [
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
				{ $project: projectFields },
			],
			totalCount: [{ $count: "count" }],
		},
	});

	const aggRes = await BatchModel.aggregate(pipeline).allowDiskUse(true);
	const items = aggRes?.[0]?.items || [];
	const totalCount = aggRes?.[0]?.totalCount?.[0]?.count || 0;

	// appliedFilters for UI/debugging (only provided keys)
	const appliedFilters = {};
	if (certificateId) appliedFilters.certificateId = certificateId;
	if (batchName) appliedFilters.batchName = batchName;
	if (courseName) appliedFilters.courseName = courseName;
	if (branchName) appliedFilters.branchName = branchName;
	if (startDate) appliedFilters.startDate = startDate;
	if (endDate) appliedFilters.endDate = endDate;

	return {
		items,
		totalCount,
		page,
		limit,
		appliedFilters,
	};
}

module.exports = {
	searchStudents,
};


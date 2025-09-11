const express = require("express");
const { authorize } = require('../middleware/authorize');
const {
	getExaminDtlById,
	updateExaminById,
	getMyCertList,
	isIssuedCert,
	getExportableData,
	certIdIncrementor,
	deleteIssuedCertificateByBatch,
	issueSingleCertificateById,
	gsReadRangeCtrl,
	gsReadSheetCtrl,
	gsUpdateRangeCtrl,
	gsAppendRowCtrl,
	gsAppendRowsCtrl,
	gsFindDuplicatesCtrl,
	getAllIssueCertDataSorted,
} = require('../controllers/issuedCertificateController');

const issuedCertificateRouter = express.Router();


issuedCertificateRouter.get('/getExaminDtlById/:batchId',getExaminDtlById);
issuedCertificateRouter.get('/getExportableData/:batchId',getExportableData);
issuedCertificateRouter.put('/updateExaminById/:issuedCertificateId', authorize('issueCertificate'), updateExaminById);
issuedCertificateRouter.get('/getMyCertList/:studentId', getMyCertList);// get certificate list by studentId
issuedCertificateRouter.post('/isIssuedCert', isIssuedCert);// check certificate is issued or not

// Issue a single certificate by batchId and studentId
// Accept batchId and studentId as URL params to match controller's req.params usage
issuedCertificateRouter.post('/issueSingleCertificate/:batchId/:studentId', authorize('issueCertificate'), issueSingleCertificateById);

// POST route for certIdIncrementor
issuedCertificateRouter.post('/certIdIncrementor', authorize('certificateIdChange'), certIdIncrementor);
issuedCertificateRouter.delete('/deleteIssuedCertificateByBatch/:batchId', authorize('certificateIdChange'), deleteIssuedCertificateByBatch);

// Google Sheets utility endpoints (admin-only context recommended)
issuedCertificateRouter.get('/sheets/range', gsReadRangeCtrl);
issuedCertificateRouter.get('/sheets/read', gsReadSheetCtrl);
issuedCertificateRouter.post('/sheets/updateRange', gsUpdateRangeCtrl);
issuedCertificateRouter.post('/sheets/appendRow', gsAppendRowCtrl);
issuedCertificateRouter.post('/sheets/appendRows', gsAppendRowsCtrl);
issuedCertificateRouter.get('/sheets/duplicates', gsFindDuplicatesCtrl);

// Aggregated issue certificate data (sorted by certificateId)
issuedCertificateRouter.get('/allIssueData', getAllIssueCertDataSorted);
// Alias with different casing/spelling as mentioned by user
issuedCertificateRouter.get('/allIssuedata', getAllIssueCertDataSorted);

module.exports = {issuedCertificateRouter};
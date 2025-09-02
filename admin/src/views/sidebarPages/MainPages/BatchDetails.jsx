import React, { useState, useEffect, use } from 'react'
import { Table, Modal, Button, Form, Col, Row, Spinner } from 'react-bootstrap'
import { FaPencilAlt, FaEye, FaCheckCircle, FaIdCard } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import { CgProfile } from 'react-icons/cg'
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

import '../../SidebarCss/Table.css' // Adjust CSS file path
import '../../../components/custom/Table_DatePicker.css'
import axios from 'axios';
import { BASE_URL } from '../../../BaseURL'

import { GrScorecard } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'
import { FaFilePdf } from 'react-icons/fa'
import UpdateBatch from './UpdateBatch'
import { FaLink } from 'react-icons/fa'; // Add at the top with other imports
import ProfilePhotoTray from "./ProfilePhotoTray";
import Date_Picker from '../../../components/custom/Date_Picker'
import InputField from '../../../components/custom/InputField'
import CustomTable from '../../../components/custom/CustomTable'
import CustomAction from '../../../components/custom/CustomAction'
import CustomButton from '../../../components/custom/CustomButton'
import ActionMenu from '../../../components/custom/ActionMenu'
import Pagination from '../../../components/custom/Pagination'

const BatchDetails = () => {

  const [role, setRole] = useState(localStorage.getItem('role'))
  const [uuid, setUuid] = useState(localStorage.getItem('uuid'))
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [editBatchId, setEditBatchId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  // New Change
  // Called by ActionMenu’s “Edit”
  const openEditModal = async (batchId) => {
    await handleViewBatch(batchId);  // Fetch and set the batch data
    setEditBatchId(batchId);
    setShowEditModal(true);
  };

  // Pass this into UpdateBatch so it can close itself
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditBatchId(null);
  };


  const [showPhotoTray, setShowPhotoTray] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchName, setSearchName] = useState(null)
  const [searchName2, setSearchName2] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const limit = 50

  const [batch, setBatch] = useState([])
  const [viewBatch, setViewBatch] = useState({}) // State for viewing batch details
  const [isEditable, setIsEditable] = useState(true)
  // Number of rows per page (both for main table and modal)

  const [trainers, setTrainers] = useState([])
  const [selectedTrainerId, setSelectedTrainerId] = useState('')

  const [accessors, setAccessors] = useState([])
  const [selectedAccessorId, setSelectedAccessorId] = useState('')

  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const [batchIdTwo, setBatchIdTwo] = useState('')
  const [isExamin, setIsExamin] = useState(false)
  const [examinStud, setExaminStud] = useState([])
  const [issuedCertificateId, setIssuedCertificateId] = useState('')
  const [assessment, setAssessment] = useState({})
  //for check boxes
  const [selectedStudents, setSelectedStudents] = useState([]) // State to track selected students
  const [grades, setGrades] = useState({})
  const [meterDives, setmeterDives] = useState({});

  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState('')

  const [validity, setValidity] = useState('')

  const [isDownloading, setIsDownloading] = useState('')

  const navigate = useNavigate()

  //back to main
  const backToMain = (isExamin) => {
    setSearchName("");
    setSearchName2("");
    setIsExamin(isExamin)
    setBatchIdTwo('')
  }

  // Function to handle individual student selection
  const handleStudentSelect = (studentId) => {
    setSelectedStudents(
      (prevSelected) =>
        prevSelected.includes(studentId)
          ? prevSelected.filter((id) => id !== studentId) // Deselect if already selected
          : [...prevSelected, studentId], // Select the student
    )
  }

  // Function to handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = examinStud.map((student) => {
        if (student.isProfile !== "Rejected") {
          return student.studentId;
        }
      })
      setSelectedStudents(allIds)
    } else {
      setSelectedStudents([])
    }
  }

  //fetch trainer for dropdown
  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/trainer/getTrainerList`)
      const { trainers } = response.data

      setTrainers(trainers || []) // Ensure trainers is an array
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch trainers.')
    }
  }

  //fetch accessor for dropdown
  const fetchAccessors = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/accessor/getAccessorList`)
      const respData = response.data

      if (respData?.success) {
        setAccessors(respData?.accessors || [])
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch accessors.')
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/course/getAllCourses`)
      const respData = response.data

      if (respData?.success) {
        setCourses(respData?.coursesList || [])
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch courses.')
    }
  }

  const goToview = (batch) => navigate('/batchmembers', { state: { studIdsList: batch?.studentIds, batchId: batch?.batchId }, })


  //fetch branches
  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/branch/getAllBranches`)
      const respData = response.data

      if (respData?.success) {
        setBranches(respData?.branchesList || [])
      } else {
        toast.error(respData?.message || 'Branches not available')
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  //when click on view
  const handleViewBatch = async (batchId) => {
    try {
      const response = await axios.get(`${BASE_URL}/batch/getBatchById/${batchId}`)
      const respData = response.data

      if (respData?.success) {
        setViewBatch(respData?.batchDtl)
        setSelectedAssessments(respData?.batchDtl?.assessment)
        fetchTrainers()
        fetchAccessors()
        fetchCourses()
        fetchBranches()
      } else {
        toast.error(respData?.message || 'Error fetching batch details', { position: 'top-center' })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after some time.')
    }
  }

  const [selectedAssessments, setSelectedAssessments] = useState({
    grade: false,
    meterDive: false,
  })

  // Main table pagination logic
  const paginatedBatch = batch

  //delete batch
  const handleDelete = async (batchId) => {
    const result = await MySwal.fire({
      title: 'Delete Batch Details?',
      text: 'This action cannot be undone.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EBA135',  // Yellow (for destructive action)
      cancelButtonColor: '#374174',   // Navy Blue
      background: '#fefefe',
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      }
    });
    if (result.isConfirmed) {
      try {

        const response = await axios.delete(`${BASE_URL}/batch/deleteBatchById/${batchId}`)
        const respData = response.data

        if (respData?.success) {
          getBatchDtl(currentPage)
          toast.success(respData?.message || 'Batch deleted successfully', {
            position: 'top-center',
          })
        } else {
          toast.error(respData?.message || 'Batch not exist', { position: 'top-center' })
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
      }
    }
  }

  //complete batch by trainer and assign to examiner
  const updateComplete = async (batchId) => {
    const result = await MySwal.fire({
      title: 'Complete This Batch?',
      text: 'Are you sure you want to mark this batch as completed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Complete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#374174', // Navy blue
      cancelButtonColor: '#EBA135',  // Yellow
      background: '#fefefe',
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`${BASE_URL}/batch/compByTrainer/${batchId}`)
        const respData = response.data

        if (respData?.success) {
          getBatchDtl(currentPage)
          toast.success(respData?.message || 'Batch assign to Examiner')
        } else {
          toast.error(respData?.message || 'Fail to complete batch')
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
      }
    }
  }

  //check issued or not
  const isIssuedCert = async (studentId, batchId) => {
    try {
      const reqData = {
        studentId,
        batchId,
      }
      const response = await axios.post(`${BASE_URL}/issuedCert/isIssuedCert`, reqData)
      const respData = response.data

      if (respData?.success) {
        return true
      }
    } catch (error) {
      return false
    }
  }

  //download student certificate
  const dwnCertificate = async (studentId, batchId, studentName) => {
    try {
      setIsDownloading(studentId)
      const isIssued = await isIssuedCert(studentId, batchId)

      if (!isIssued) {
        toast.error('Certificate is not issued yet.')
        setIsDownloading('')
        return
      }
      const response = await axios.post(
        `${BASE_URL}/certificate/downloadCert`,
        {
          batchId: batchId,
          studentId: studentId,
        },
        {
          responseType: 'blob',
          validateStatus: () => true,
        },
      )

      // Check if response is an error (not a PDF)
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        // Try to parse error message from blob
        const text = await response.data.text();
        let errorMsg = 'Failed to download certificate.';
        try {
          const errJson = JSON.parse(text);
          errorMsg = errJson.message || errorMsg;
        } catch (error) {
          console.error('Error parsing error message:', error);
        }
        toast.error(errorMsg);
        setIsDownloading('');
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]))

      // Create a link element to download the PDF
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${studentName}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Revoke the object URL to free memory
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    } finally {
      setIsDownloading('')
    }
  }

  const dwnLicense = async (studentId, batchId, studentName) => {
    try {
      setIsDownloading(studentId + '_license');
      const response = await axios.post(
        `${BASE_URL}/license/create`,
        {
          batchId: batchId,
          studentId: studentId,
        },
        {
          responseType: 'blob',
          validateStatus: () => true,
        }
      );

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        const text = await response.data.text();
        let errorMsg = 'Failed to download license.';
        try {
          const errJson = JSON.parse(text);
          errorMsg = errJson.message || errorMsg;
        } catch (error) {
          console.error('Error parsing error message:', error);
        }
        toast.error(errorMsg);
        setIsDownloading('');
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName}_license.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after some time.');
    } finally {
      setIsDownloading('');
    }
  };

  const handleBatchDownload = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student to download.');
      return;
    }
    setIsBatchDownloading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/certificate/downloadMultCert`,
        { batchId: batchIdTwo, studentIds: selectedStudents },
        { responseType: 'blob', validateStatus: () => true }
      );
      const batchName = batch.find(b => b.batchId === batchIdTwo)?.batchName || 'Unknown_Batch';
      // Validate ZIP response
      const ct = response.headers['content-type'];
      if (!ct || !ct.includes('application/zip')) {
        const text = await response.data.text();
        const err = JSON.parse(text || '{}').message || 'Failed to download certificates.';
        throw new Error(err);
      }
      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${batchName}_certificates.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsBatchDownloading(false);
    }
  };

  const handleBulkLicenseDownload = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student to download.');
      return;
    }
    setIsBatchDownloading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/license/createBulk`,
        { batchId: batchIdTwo, studentIds: selectedStudents },
        { responseType: 'blob', validateStatus: () => true }
      );
      const batchName = batch.find(b => b.batchId === batchIdTwo)?.batchName || 'Unknown_Batch';
      const ct = response.headers['content-type'];

      if (!ct || !ct.includes('application/zip')) {
        const text = await response.data.text();
        const err = JSON.parse(text || '{}').message || 'Failed to download licenses.';
        throw new Error(err);
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${batchName}_licenses.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsBatchDownloading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const statusColor = (status) => {
    if (status === 'Completed') {
      return '#374174'
    } else if (status === 'Pending') {
      return '#EBA135'
    } else {
      return 'blue'
    }
  }

  // Get batch details
  const getBatchDtl = async (currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/batch/getAllBatch`, {
        params: {
          page: currentPage,
          limit,
          role,
          uuid,
          searchName,
          // statusFilter,
          dateFrom,
          dateTo,
        },
      })
      const respData = response.data

      if (respData?.success) {
        setBatch(respData?.allBatchDtl)
        setTotalPages(respData?.totalPages)
      } else {
        toast.error(respData.message || 'No batch available')
      }
    } catch (error) {
      setBatch([])
      setTotalPages(1)
    }
  }

  //fetch examin table details
  const examinStudent = async (batchId) => {
    setIsExamin(!isExamin)
    setBatchIdTwo(batchId)
    try {
      const response = await axios.get(`${BASE_URL}/issuedCert/getExaminDtlById/${batchId}`)
      const respData = response.data

      if (respData?.success) {
        setExaminStud(respData?.issuedData?.studList)
        setIssuedCertificateId(respData?.issuedData?.issuedCertificateId)
        setAssessment(respData?.issuedData?.assessment);
      } else {
        toast.error(respData?.message || "Fail to fetch student data");
      }
    } catch (error) {
      console.log(error);
      setExaminStud([])
    }
  }

  // Handle grade selection for each student
  const handleGradeChange = (studentId, grade) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [studentId]: grade,
    }))
  }

  // Handle meterDive for each student
  const handlemeterDiveChange = (studentId, perc) => {
    setmeterDives((prevPerc) => ({
      ...prevPerc,
      [studentId]: perc,
    }))
  }

  const clearIssuedCertificates = async (batchId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/issuedCert/deleteIssuedCertificateByBatch/${batchId}`);
      const respData = response.data;

      if (respData?.success) {
        toast.success(respData?.message || 'Issued certificates cleared successfully');
        setExaminStud([]);
        setSelectedStudents([]);
      } else {
        toast.error(respData?.message || 'Failed to clear issued certificates');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after some time.');
    }
  };

  // assign batch to admin for issued certificates
  const assignToAdmin = async (role) => {
    if (selectedStudents.length === 0) {
      toast.error('Please select student')
      return
    }

    const selectedData = examinStud
      .filter((student) => selectedStudents.includes(student.studentId))
      .map((student) => ({
        ...student,
        grade: grades[student.studentId] || student.grade || 'Not graded',
        meterDive: meterDives[student.studentId] || student.meterDive || "NA"
      }))

    try {
      // issuedCertificateId
      const response = await axios.put(
        `${BASE_URL}/issuedCert/updateExaminById/${issuedCertificateId}`,
        { selectedData, role },
      )
      const respData = response.data

      if (respData?.success) {
        toast.success(respData?.message || 'Process Completed')
      } else {
        toast.error(respData?.message || 'Fail to process your request')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after some time.')
    } finally {
      setIsExamin(!isExamin)
      setSelectedStudents([])
      setGrades({})
    }
  }


  useEffect(() => {
    getBatchDtl(currentPage)
  }, [currentPage, dateFrom, dateTo, searchName])

  const generateShareLink = async (batchId) => {
    try {
      const response = await axios.post(`${BASE_URL}/batch/generate`, { batchId });
      if (response.data.success && response.data.shareUrl) {
        await navigator.clipboard.writeText(response.data.shareUrl);
        toast.success('Share link copied to clipboard!');
      } else {
        toast.error(response.data.message || 'Failed to generate link');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error generating link');
    }
  };

  // CertId Incrementor modal state
  const [showCertIdModal, setShowCertIdModal] = useState(false);
  const [oldCertId, setOldCertId] = useState("");
  const [oldStartId, setOldStartId] = useState("");
  const [newCertPrefix, setNewCertPrefix] = useState("");
  const [startNumber, setStartNumber] = useState("");
  const [issuedDate, setIssuedDate] = useState(null);
  const [certIdLoading, setCertIdLoading] = useState(false);
  const [certIdError, setCertIdError] = useState("");

  // Pre-fill issuedDate when modal opens
  useEffect(() => {
    if (showCertIdModal) {
      // Find first issued student's certificateId and issuedDate
      const firstIssued = examinStud.find(s => s.issued && s.certificateId);
      if (firstIssued && firstIssued.certificateId) {
        // Try to extract prefix and start number
        const match = firstIssued.certificateId.match(/^(.*?)(\d+)$/);
        if (match) {
          setOldCertId(match[1]);
          setOldStartId(match[2]);
        } else {
          setOldCertId("");
          setOldStartId("");
        }
      } else {
        setOldCertId("");
        setOldStartId("");
      }
      if (firstIssued && firstIssued.issuedDate) {
        setIssuedDate(new Date(firstIssued.issuedDate));
      } else {
        setIssuedDate(new Date());
      }
    }
  }, [showCertIdModal, examinStud]);

  // Handler for certIdIncrementor
  const handleCertIdIncrementor = async () => {
    const result = await MySwal.fire({
      title: 'Update Certificate IDs?',
      text: 'Are you sure you want to update Certificate IDs and Issued Date for this batch?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#374174', // Navy blue
      cancelButtonColor: '#EBA135',  // Yellow
      background: '#fefefe',
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      }
    });
    if (!result.isConfirmed) return;
    setCertIdLoading(true);
    setCertIdError("");
    try {
      const payload = {
        batchId: batchIdTwo,
        old_cert_id: oldCertId,
        old_start_id: Number(oldStartId),
        new_cert_prefix: newCertPrefix,
        start_number: Number(startNumber),
        new_issued_date: issuedDate ? issuedDate.toISOString() : null,
      };
      const response = await axios.post(`${BASE_URL}/issuedCert/certIdIncrementor`, payload);
      if (response.data.success) {
        toast.success("Certificate IDs and Issued Date updated!");
        setShowCertIdModal(false);
        examinStudent(batchIdTwo); // Refresh examinStud data
        // Optionally refresh examinStud data here
      } else {
        setCertIdError(response.data.message || "Update failed.");
      }
    } catch (err) {
      setCertIdError(err?.response?.data?.message || "Server error.");
    } finally {
      setCertIdLoading(false);
    }
  };


  return (
    <>
      <div className="mainTableContainer">
        {(!isExamin && !showPhotoTray) && (
          <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>All Batches</h4>
        )}

        {(!isExamin && !showPhotoTray) && (
          <div className="table-container">
            <div className="row position-relative mb-2 d-flex align-items-center">
              <div className="col-lg-3 d-flex justify-content-center">
                <div style={{ width: "100%" }}>
                  <InputField label="Search By" value={searchName} onChange={setSearchName} placeholder="Search by batch, course, examiner, trainer" />
                </div>
              </div>

              <div className="col-lg-2 d-flex justify-content-end">
                <div style={{ width: "100%" }}>
                  <Date_Picker label="Start Date" fontSize="14px" value={dateFrom} onChange={setDateFrom} placeholder="Start Date" iconRight="" />
                </div>
              </div>

              <div className="col-lg-2 d-flex justify-content-end">
                <div style={{ width: "100%" }}>
                  <Date_Picker label="End Date" fontSize="14px" value={dateTo} onChange={setDateTo} placeholder="End Date" iconRight="" />
                </div>
              </div>
              <div className="col-lg-5 mt-4 d-flex align-items-end justify-content-end">
                <div className='d-flex justify-content-end' style={{ width: "100%" }}>
                  <CustomButton title='Create Batch' icon="tabler_plus.svg" onClick={() => navigate("/create-batch")} />
                </div>
              </div>
            </div>
            <div className='table-responsive mt-4'>
              <table className="table inner-table-container table-bordered table-hover align-middle text-center custom-table accessor-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th className="special-yellow">Batch Name</th>
                    <th className="special-blue">Course Name</th>
                    {/* <th>Examiner</th> */}
                    {/* <th>Trainer</th> */}
                    {/* <th>Start Date</th> */}
                    {/* <th>End Date</th> */}
                    {/* <th>Count</th> */}
                    <th>By Admin</th>
                    <th>By Examiner</th>
                    <th>By Trainer</th>
                    {/* <th>Status</th> */}
                    <th>Action</th>
                  </tr>
                </thead>
                {paginatedBatch?.length === 0 ? (
                  <div className="">No batch available</div>
                ) : (
                  <tbody>
                    {paginatedBatch?.map((batch, index) => (
                      <tr className='cursor-pointer' key={index}>
                        <td onClick={() => goToview(batch)}>{(currentPage - 1) * limit + index + 1}</td>
                        <td className="special-yellow" onClick={() => goToview(batch)}>{batch.batchName}</td>
                        <td className="special-blue" onClick={() => goToview(batch)}>{batch.courseName}</td>
                        <td onClick={() => goToview(batch)} style={{ fontWeight: '500', color: statusColor(batch?.byAdmin) }}>
                          {batch?.byAdmin?.toUpperCase()}
                        </td>
                        <td onClick={() => goToview(batch)} style={{ fontWeight: '500', color: statusColor(batch?.byExaminer) }}>
                          {batch?.byExaminer?.toUpperCase()}
                        </td>
                        <td onClick={() => goToview(batch)} style={{ fontWeight: '500', color: statusColor(batch?.byTrainer) }}>
                          {batch?.byTrainer?.toUpperCase()}
                        </td>
                        <td className="position-relative">

                          <ActionMenu
                            options={[
                              {
                                title: 'Edit',
                                icon: 'material-symbols_edit-outline.svg',
                                onClick: async () => await openEditModal(batch.batchId),
                              },
                              role === 'trainer' && batch.byTrainer !== 'Completed' ? {
                                title: 'Assign',
                                icon: 'fluent_certificate-24-regular.svg',
                                onClick: () => updateComplete(batch.batchId),
                              } : null,
                              role !== 'trainer' ? {
                                title: 'Assign',
                                icon: 'fluent_certificate-24-regular.svg',
                                onClick: () => examinStudent(batch.batchId),
                              } : null,
                              role === 'admin' && {
                                title: 'Delete',
                                icon: 'material-symbols_delete-outline.svg',
                                onClick: () => handleDelete(batch.batchId),
                              },
                              role === 'admin' && {
                                title: 'Photos',
                                icon: 'Group.svg',
                                onClick: () => {
                                  setSelectedBatchId(batch.batchId);
                                  setShowPhotoTray(true);
                                },
                              },
                              role === 'admin' && {
                                title: 'Link',
                                icon: 'material-symbols_link-rounded.svg',
                                onClick: () => generateShareLink(batch.batchId),
                              },
                              role === 'admin' && {
                                title: 'Clone',
                                icon: 'Clone.svg',
                                onClick: async () => {
                                  const result = await MySwal.fire({
                                    title: 'Clone Batch?',
                                    text: 'Are you sure you want to clone this batch? All setup and students will be copied.',
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonText: 'Yes, Clone',
                                    cancelButtonText: 'Cancel',
                                    confirmButtonColor: '#374174',
                                    cancelButtonColor: '#EBA135',
                                    background: '#fefefe',
                                    customClass: {
                                      popup: 'custom-swal-popup',
                                      confirmButton: 'swal-confirm-btn',
                                      cancelButton: 'swal-cancel-btn',
                                    }
                                  });
                                  if (!result.isConfirmed) return;
                                  try {
                                    const response = await axios.post(`${BASE_URL}/batch/cloneBatch`, { batchId: batch.batchId });
                                    if (response.data.success) {
                                      toast.success('Batch cloned successfully!');
                                      getBatchDtl(currentPage);
                                    } else {
                                      toast.error(response.data.message || 'Failed to clone batch');
                                    }
                                  } catch (err) {
                                    toast.error(err?.response?.data?.message || 'Error cloning batch');
                                  }
                                }
                              },
                            ].filter(Boolean)}
                          />

                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
            {/* Render UpdateBatch modal when requested */}
            {showEditModal && (
              <UpdateBatch
                batchId={editBatchId}
                onClose={closeEditModal}
                show={true}
                viewBatchFunc={setViewBatch}
                viewBatch={viewBatch}
              // pass any other props UpdateBatch needs
              />
            )}
          </div>
        )}


        {isExamin && (
          <>
            <div className="row">
              <div className="col-4"><CustomButton
                title="Back"
                icon="Arrow_b.svg"
                variant='outline'
                onClick={() => backToMain(!isExamin)}
              />
              </div>
              <div className="col-4">
                <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>
                  Examin Student
                </h4>
              </div>
              <div className="col-4"></div>
            </div>

            <div className="mt-4">
              {/* Action Buttons */}
              <div className='mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3'>

                <InputField
                  value={searchName2}
                  onChange={setSearchName2}
                  placeholder="Search by student name"
                  style={{ width: '300px', marginTop: '0px' }}
                />

                <div className="d-flex gap-2">
                  {role === 'admin' && (
                    <CustomButton
                      title={isBatchDownloading ? <Spinner as="span" animation="border" size="sm" /> : "Download Certificates"}
                      icon="Download_w.svg"
                      onClick={handleBatchDownload}
                      disabled={selectedStudents.length === 0 || isBatchDownloading}
                    />
                  )}

                  {role === 'admin' && (
                    <CustomButton
                      title={isBatchDownloading ? <Spinner as="span" animation="border" size="sm" /> : "Download Licenses"}
                      icon="Download_w.svg"
                      onClick={handleBulkLicenseDownload}
                      disabled={selectedStudents.length === 0 || isBatchDownloading}
                    />
                  )}

                  <CustomButton
                    title={role === 'admin' ? 'Issue Certificate' : 'Assign to Admin'}
                    icon={role === 'admin' ? 'certificate_w.svg' : 'Check.svg'}
                    onClick={() => assignToAdmin(role)}
                  />
                  {role === 'admin' ? (
                    <>
                      <CustomButton
                        title={'Clear Issued Certificates'}
                        icon={'wrong.svg'}
                        variant='outline'
                        onClick={() => clearIssuedCertificates(batchIdTwo)}
                      />
                    </>
                  ) : <></>}
                </div>
              </div>

              <table className='table table-bordered table-hover align-middle text-center custom-table accessor-table'>
                <thead>
                  <tr>
                    <th style={{ width: "10px", padding: "14px 0px 14px 10px" }}>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedStudents.length === examinStud.length && examinStud.length > 0}
                        disabled={examinStud.every((student) => student.issued && role !== 'admin')}
                      />
                    </th>
                    <th>Sr No</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => setShowCertIdModal(true)}>
                      Certificate ID
                    </th>
                    <th>Profile</th>
                    <th className="special-yellow">Name</th>
                    <th>Profile</th>
                    <th className="special-blue">Mobile No</th>
                    {assessment?.grade && <th>Grade</th>}
                    {assessment?.meterDive && <th>Meter Dive</th>}
                    <th>Issued</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {examinStud
                    .filter(student =>
                      !searchName2 || student?.studentName?.toLowerCase()?.includes(searchName2.toLowerCase())
                    )
                    .map((data, index) => (
                      <tr key={data?.studentId}>
                        <td style={data.isProfile === "Rejected" ? { backgroundColor: '#ffeaea', width: "10px", padding: "14px 0px 14px 10px" } : { width: "10px", padding: "14px 0px 14px 10px" }}>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(data.studentId)}
                            onChange={() => data.isProfile !== "Rejected" && handleStudentSelect(data.studentId)}
                            disabled={data.issued && role !== 'admin'}
                          />
                        </td>
                        <td>{index + 1}</td>
                        <td>{data.certificateId}</td>
                        <td>
                          <img
                            src={data.imagePath ? `${BASE_URL}/${data.imagePath}` : '/placeholder.jpg'}
                            alt="No Profile"
                            className="common-image"
                          />
                        </td>
                        <td className="special-yellow">{data?.studentName}</td>
                        <td>{data?.isProfile}</td>
                        <td className="special-blue">{data?.mobile}</td>
                        {assessment?.grade && (
                          <td style={{ width: '6%' }}>
                            <select
                              value={grades[data.studentId] || data?.grade || ''}
                              onChange={(e) => handleGradeChange(data.studentId, e.target.value)}
                              style={{ width: '100%', border: 'none', background: 'transparent' }}
                              disabled={data.issued && role !== 'admin'}
                            >
                              <option value="">{data?.grade || 'Grade'}</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="F">F</option>
                            </select>
                          </td>
                        )}
                        {assessment?.meterDive && (
                          <td style={{ width: '5%' }}>
                            <Form.Control
                              type="number"
                              value={
                                meterDives.hasOwnProperty(data.studentId)
                                  ? meterDives[data.studentId]
                                  : data?.meterDive || ''
                              }
                              onChange={(e) => handlemeterDiveChange(data.studentId, e.target.value)}
                              placeholder="m"
                              disabled={data.issued && role !== 'admin'}
                            />
                          </td>
                        )}
                        <td>{data?.issued ? 'Yes' : 'No'}</td>
                        <td>
                          {data?.issued && data?.isProfile !== "Rejected" && (
                            <ActionMenu
                              options={[
                                {
                                  icon: 'certificate_b.svg',
                                  title: 'Download Certificate',
                                  onClick: () => dwnCertificate(data.studentId, batchIdTwo, data?.studentName?.replace(/\s/g, '')),
                                  isLoading: isDownloading === data.studentId,
                                },
                                {
                                  icon: 'idcard_b.svg',
                                  title: 'Download License',
                                  onClick: () => dwnLicense(data.studentId, batchIdTwo, data?.studentName?.replace(/\s/g, '')),
                                  isLoading: isDownloading === data.studentId + '_license',
                                },
                              ]}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Examin Table end */}

        {/* Pagination for the main table */}
        {(!isExamin && !showPhotoTray) && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Profile Photo Tray - Conditional Rendering */}
        {showPhotoTray && (
          <ProfilePhotoTray
            batchId={selectedBatchId}
            onBack={() => setShowPhotoTray(false)}
          />
        )}

        <Toaster
          position="top-center"
          reverseOrder={true}
        />

        {/* CertId Incrementor Modal */}
        <Modal show={showCertIdModal} onHide={() => setShowCertIdModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Update Certificate IDs & Issued Date</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="row">
                <div className="col-6 px-4 py-2"><InputField
                  label="Old Certificate Prefix"
                  value={oldCertId}
                  onChange={setOldCertId}
                  placeholder="e.g. I/A/"
                  readOnly
                /></div>
                <div className="col-6 px-4 py-2"><InputField
                  label="Old Start Number"
                  type="number"
                  value={oldStartId}
                  onChange={setOldStartId}
                  placeholder="e.g. 25663"
                  readOnly
                /></div>
                <div className="col-6 px-4 py-2"><InputField
                  label="New Certificate Prefix"
                  value={newCertPrefix}
                  onChange={setNewCertPrefix}
                  placeholder="e.g. I/A/"
                /></div>
                <div className="col-6 px-4 py-2"><InputField
                  label="New Start Number"
                  type="number"
                  value={startNumber}
                  onChange={setStartNumber}
                  placeholder="e.g. 25635"
                /></div>
              </div>




              <Form.Group className="mb-2 px-3">
                <Form.Label>Issued Date</Form.Label>
                <Date_Picker value={issuedDate} onChange={setIssuedDate} />
              </Form.Group>
            </Form>
            {certIdLoading && <Spinner animation="border" size="sm" />}
            {certIdError && <div className="text-danger mt-2">{certIdError}</div>}
          </Modal.Body>
          <Modal.Footer className='pb-4'>
            <CustomButton icon="wrong.svg" title="Cancel" variant="outline" onClick={() => setShowCertIdModal(false)} />
            <CustomButton icon="Edit_Pencil_w.svg" title="Update" onClick={handleCertIdIncrementor} disabled={certIdLoading} />
          </Modal.Footer>
        </Modal>
      </div>


    </>
  )
}

export default BatchDetails
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import '../../SidebarCss/Table.css' // Import the CSS file
import { BASE_URL } from '../../../BaseURL' // Import the BASE_URL
import { Modal, Form, Spinner } from 'react-bootstrap'
import toast, { Toaster } from 'react-hot-toast';
import { formatName, normalizeEmail, toISODate } from '../../../utils/dataHelpers';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

import 'react-toastify/dist/ReactToastify.css' // Import CSS for react-toastify
// Importing XLSX for Excel file reading
import * as XLSX from 'xlsx' // Import XLSX to read Excel files
import { useNavigate } from 'react-router-dom'
import InputField from '../../../components/custom/InputField'
import Date_Picker from '../../../components/custom/Date_Picker'
import CustomButton from '../../../components/custom/CustomButton'
import ActionMenu from '../../../components/custom/ActionMenu'
import Pagination from '../../../components/custom/Pagination'
import RegisterStudentForm from './RegisterStudentForm'

const RegisteredStudentsTable = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showModal, setShowModal] = useState(false) // Modal visibility state
  const [viewModal, setViewModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const limit = 50 // Set the number of items per page
  // State to manage edit mode and student data
  const [isEditMode, setIsEditMode] = useState(false)
  const [studentData, setStudentData] = useState(selectedStudent)
  const navigate = useNavigate() // Initialize useNavigate
  const [selectedFiles, setSelectedFiles] = useState({
    imagePath: null,
    adhaarImage: null,
  })

  const [isImporting, setIsImporting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Add these states at the top
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  // Fetch registered students from the backend
  const fetchStudents = async (currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/student/getRegisteredStud`, {
        params: { page: currentPage, limit, searchTerm, dateFrom, dateTo }, // Add dateFrom/dateTo
      })

      const respData = response.data

      if (respData?.success) {
        setStudents(respData.studentDtl)
        setTotalPages(respData.totalPages) // Set total pages from response
      } else {
        toast.error(respData?.message || 'No Student available')
      }
    } catch (err) {
      setStudents([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  // Handle toggle between edit and save
  // Effect to initialize student data when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      setStudentData({ ...selectedStudent }) // Create a copy to avoid mutating the original
    }
  }, [selectedStudent])


  useEffect(() => {
    fetchStudents(currentPage)
  }, [currentPage, searchTerm, dateFrom, dateTo])


  const handleChangeStudent = (e) => {
    const { name, value } = e.target
    setStudentData((prevData) => ({
      ...prevData,
      [name]: value, // Update the respective field
    }))
  }

  const handleFileChange = (e, fileType) => {
    setSelectedFiles({
      ...selectedFiles,
      [fileType]: e.target.files[0], // Save the selected file
    })
  }

  //handle edit
  const handleIsEdit = () => {
    setIsEditMode(!isEditMode)
  }

  //update student details
  const handleUpdate = async (studentData) => {
    const frmData = new FormData()
    frmData.append('name', formatName(studentData?.name))
    frmData.append('email', normalizeEmail(studentData?.email))
    frmData.append('mobile', studentData?.mobile)
    frmData.append('dob', studentData?.dob)
    frmData.append('gender', studentData?.gender)
    frmData.append('address', studentData?.address)
    frmData.append('occupation', studentData?.occupation)
    frmData.append('qualification', studentData?.qualification)
    frmData.append('bloodGrp', studentData?.bloodGrp)
    frmData.append('profileImage', selectedFiles.imagePath)
    frmData.append('aadharImage', selectedFiles.adhaarImage)

    try {
      const response = await axios.put(
        `${BASE_URL}/student/updateStudById/${studentData.studentId}`,
        frmData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      const respData = response.data
      if (respData?.success) {
        toast.success(respData?.message || 'Detail update successfully', { position: 'top-center' })
        setIsEditMode(!isEditMode)
        setViewModal(false)
        fetchStudents(currentPage)
      } else {
        toast.error(respData?.message || 'Fail to update details')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    }
  }

  //import student via excel
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Utility: parse various date formats into ISO




    function parseDateString(input) {
      const MONTHS = {
        jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
        jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
      };
      if (input == null || input === '') {
        throw new Error('Empty date');
      }

      // 1. If it's a number or a pure-digit string → Excel serial
      if (
        typeof input === 'number' ||
        (typeof input === 'string' && /^\d+$/.test(input))
      ) {
        const serial = Number(input);
        // Format as dd/mm/yyyy via SheetJS
        const formatted = XLSX.SSF.format('dd/mm/yyyy', serial);
        // split and re-join as dd-mm-yyyy
        const [d, m, y] = formatted.split('/');
        return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
      }

      // normalize to string
      let s = input.toString().trim();

      // 2. Numeric dates: dd[-/.]mm[-/.]yyyy or yy
      const numericRe = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/;
      let m = s.match(numericRe);
      if (m) {
        let [, d, mo, y] = m;
        if (y.length === 2) y = '20' + y;
        d = d.padStart(2, '0');
        mo = mo.padStart(2, '0');
        if (+d < 1 || +d > 31 || +mo < 1 || +mo > 12 || y.length !== 4) {
          throw new Error(`Invalid numeric date parts: ${s}`);
        }
        return `${d}-${mo}-${y}`;
      }

      // 3. Alpha-month dates: “7 Mar 2000” or “07 March 00”
      const alphaRe = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/;
      m = s.match(alphaRe);
      if (m) {
        let [, d, mon, y] = m;
        const key = mon.substr(0, 3).toLowerCase();
        const moNum = MONTHS[key];
        if (!moNum) throw new Error(`Unknown month: ${mon}`);
        if (y.length === 2) y = '20' + y;
        d = d.padStart(2, '0');
        const mo = String(moNum).padStart(2, '0');
        if (+d < 1 || +d > 31 || y.length !== 4) {
          throw new Error(`Invalid alpha date parts: ${s}`);
        }
        return `${d}-${mo}-${y}`;
      }

      // 4. Fallback to JS Date
      const dt = new Date(s);
      if (isNaN(dt.getTime())) {
        throw new Error(`Cannot parse date: "${s}"`);
      }
      const d = String(dt.getDate()).padStart(2, '0');
      const mo = String(dt.getMonth() + 1).padStart(2, '0');
      const y = dt.getFullYear();
      return `${d}-${mo}-${y}`;
    }

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const [header, ...dataRows] = rows;

      // Build header map
      const headerMap = header.reduce((m, col, idx) => ({ ...m, [col.trim().toLowerCase()]: idx }), {});
      const requiredCols = ['name', 'email', 'dob', 'gender', 'mobile', 'occupation', 'qualification', 'address', 'bloodgrp'];
      for (const col of requiredCols) {
        if (!(col in headerMap)) {
          toast.error(`Missing column: ${col}`);
          return;
        }
      }

      // Preload existing emails/mobiles
      let existingEmails = new Set(), existingMobiles = new Set();
      try {
        const res = await axios.get(`${BASE_URL}/student/registered-students`);
        const studs = res.data.students || [];
        existingEmails = new Set(studs.map(s => s.email?.toLowerCase()));
        existingMobiles = new Set(studs.map(s => String(s.mobile)));
      } catch {
        toast.error('Could not fetch existing records; duplicate check disabled.');
      }

      const imported = [];
      const failed = [];
      const seenEmails = new Set();
      const seenMobiles = new Set();

      dataRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        // Skip fully empty rows
        const empty = requiredCols.every(c => !String(row[headerMap[c]]).trim());
        if (empty) return;

        const record = {};
        const errs = [];

        // Name
        const nm = String(row[headerMap['name']]).trim();
        if (!nm) errs.push('Name required');
        record.name = nm && formatName(nm);

        // Email
        const em = String(row[headerMap['email']]).trim().toLowerCase();
        if (!em) errs.push('Email required');
        else if (!/^[^@]+@[^@]+\.[^@]+$/.test(em)) errs.push('Email invalid');
        else if (seenEmails.has(em) || existingEmails.has(em)) errs.push('Email duplicate');
        record.email = em;

        // DOB
        const db = String(row[headerMap['dob']]).trim();
        try { record.dob = toISODate(parseDateString(db)); }
        catch (ex) { errs.push(`DOB: ${ex.message}`); }

        // Gender
        const gd = String(row[headerMap['gender']]).trim().toLowerCase();
        if (!['male', 'female', 'other'].includes(gd)) errs.push('Gender must be Male/Female/Other');
        record.gender = gd;

        // Mobile
        const mb = String(row[headerMap['mobile']]).trim();
        if (!mb) errs.push('Mobile required');
        else if (!/^[1-9]\d{9}$/.test(mb)) errs.push('Mobile invalid');
        else if (seenMobiles.has(mb) || existingMobiles.has(mb)) errs.push('Mobile duplicate');
        record.mobile = mb;

        // Other optional fields (no strict validation)
        record.occupation = String(row[headerMap['occupation']]).trim();
        record.qualification = String(row[headerMap['qualification']]).trim();
        record.address = String(row[headerMap['address']]).trim();

        // Blood group
        const bg = String(row[headerMap['bloodgrp']]).trim().toUpperCase();
        if (bg && !/^(A|B|AB|O)[+-]$/.test(bg)) errs.push('BloodGrp invalid');
        record.bloodGrp = bg;

        if (errs.length) {
          failed.push({ row: rowNum, errors: errs });
        } else {
          seenEmails.add(em);
          seenMobiles.add(mb);
          imported.push(record);
        }
      });

      // Toast errors per row
      failed.forEach(f => {
        toast.error(`Row ${f.row}: ${f.errors.join(', ')}`, { autoClose: false });
      });

      if (!imported.length) {
        toast.error('No valid records to import');
        return;
      }

      // Send valid records
      try {
        const res = await axios.post(`${BASE_URL}/student/import`, { students: imported });
        if (res.data.success) {
          fetchStudents(currentPage); // Refresh the student list
          toast.success(`Imported ${res.data.students.length} students`);
        }
        else toast.error(res.data.message || 'Server import error');
      } catch (ex) {
        toast.error('Import request failed');
      }

    } catch (e) {
      console.error(e);
      toast.error('Failed to process file. Ensure it is a valid Excel.');
    }
  };

  const handleCloseModal = () => {
    fetchStudents(currentPage); // Refresh the student list when modal is closed
    setShowModal(false);

  }
  const handleShowModal = () => setShowModal(true)

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

   const downloadSinglePhoto = async (studentId) => {
  try {
    setIsDownloading(studentId); // show loading on that student

    const response = await axios.get(
      `${BASE_URL}/batch/downloadSinglePhoto/${studentId}`,
      { responseType: 'blob' }
    );

    // try to extract filename from header
    const disposition = response.headers['content-disposition'] || '';
    let filename = `student_${studentId}_photo`;
    const fileNameMatch = disposition.match(/filename\\*=UTF-8''(.+)|filename="(.+)"|filename=(.+)/i);
    if (fileNameMatch) {
      filename = decodeURIComponent(fileNameMatch[1] || fileNameMatch[2] || fileNameMatch[3]);
    } else {
      // fallback extension detection
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('jpeg')) filename += '.jpg';
      else if (contentType.includes('png')) filename += '.png';
      else filename += '.jpg';
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading photo:', error);
    toast.error('Failed to download photo.');
  } finally {
    setIsDownloading(''); // stop loading
  }
};

  // Handle deletion of a student
  const handleDelete = async (studentId) => {
    const result = await MySwal.fire({
      title: 'Delete Student Details?',
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
        const response = await axios.delete(`${BASE_URL}/student/delete-student/${studentId}`)
        const respData = response.data

        if (respData?.success) {
          setStudents((prevStudents) =>
            prevStudents.filter((student) => student.studentId !== studentId),
          )
          toast.success(toast?.message || 'Student deleted successfully!')
          fetchStudents(currentPage)
        } else {
          toast.error(respData?.message || 'Fail to delete student')
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Internal server error. Try after some time.')
      }
    }
  }

  // Format date of birth
  const formatDOB = (dob) => {
    const date = new Date(dob)
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-GB', options)
  }

  const handleViewDetails = async (studentId) => {
    try {
      const response = await axios.get(`${BASE_URL}/student/getStudById/${studentId}`)
      const respData = response.data

      if (respData?.success) {
        setSelectedStudent(respData?.studentDtl)
        setViewModal(true)
      } else {
        toast.error(response.data?.message || 'Failed to fetch student details.')
      }
    } catch (error) {
      toast.error('Failed to fetch student details.')
    }
  }

  // Open image in new tab when clicked in modal
  const handleImageClick = (url) => {
    try {
      window.open(url, '_blank');
    } catch (e) {
      console.error('Failed to open image', e);
    }
  }

  //handle download excel file
  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const response = await axios.get(`${BASE_URL}/student/downloadExcel`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'SampleExcel.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Error downloading file:')
    } finally {
      setIsDownloading(false)
    }
  }

  //icon stylling start

  const editSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: '#497AE5',
    color: 'white',
    padding: '4px',
    borderRadius: '4px',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }

  const reUploadSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: 'green',
    color: 'white',
    marginLeft: '4px',
    padding: '4px',
    borderRadius: '4px',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }
  //delete icon
  const delSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: '#d11a2a',
    padding: '4px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    marginLeft: '4px',
  }

  //icon stylling end

  useEffect(() => {
    fetchStudents(currentPage)
  }, [currentPage, searchTerm])

  const handleCloseeModal = () => {
    setViewModal(false)
    setSelectedStudent(null) // Clear the selected student when modal is closed
  }

  // Re-upload photo handler
  const handleReuploadPhoto = async (studentId, file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('imagePath', file)

    try {
      const response = await axios.put(
        `${BASE_URL}/student/reupload-profile-photo/${studentId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      if (response.data.success) {
        toast.success('Photo re-uploaded! Awaiting admin approval.')
        fetchStudents(currentPage) // or getBatchMembers(currentPage) in BatchMembers.jsx
      } else {
        toast.error(response.data.message || 'Failed to re-upload photo.')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error.')
    }
  }

  const fileInputRefs = useRef({})
  const fileInputRef = useRef({})

  const triggerFileInput = (studentId) => {
    if (fileInputRefs.current[studentId]) {
      fileInputRefs.current[studentId].click()
    }
  }

  const onFileChange = (studentId, e) => {
    const file = e.target.files[0]
    handleReuploadPhoto(studentId, file)
  }

  // --- Import Students from Excel ---
  const handleImportStudent = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mainTableContainer">
      <div className="row mb-4">
        <div className="col-3">

        </div>
        <div className="col-6"><h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>
          Registered Student Details
        </h4>
        </div>
        <div className="col-3 d-flex justify-content-end">
          <CustomButton
            title={
              isDownloading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                'Download Sample'
              )
            }
            icon="Download_w.svg"
            onClick={handleDownload}
          // variant="outline"
          />
        </div>
      </div>

      <div className='row' style={{ marginBottom: '15px', justifyContent: 'space-between', alignItems: 'center' }}>

        <div className="col-lg-8 d-flex justify-content-between">
          <div style={{ width: "40%" }}>
            <InputField
              type="text"
              label="Search By"
              placeholder="Search Name, Email, Mobile"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val)
                setCurrentPage(1)
              }}
            />
          </div>

          <div>
            <Date_Picker
              label="Start Date"
              value={dateFrom}
              onChange={(val) => {
                setDateFrom(val)
                setCurrentPage(1)
              }}
            />
          </div>

          <div>
            <Date_Picker
              label="End Date"
              value={dateTo}
              onChange={(val) => {
                setDateTo(val)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

        <div className="col-lg-4 mt-4 d-flex justify-content-end gap-2">


          <CustomButton
            title={
              <>
                {isImporting ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : "Import"}
              </>
            }
            icon="Import_b.svg"
            variant='outline'
            onClick={handleImportStudent}
          />
          <input
            type="file"
            id="importFile"
            accept=".xlsx, .xls"
            onChange={handleImport}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />

          <CustomButton
            title="Register Student"
            onClick={handleShowModal}
            icon="tabler_plus.svg"
          />
        </div>
      </div>

      <input
        type="file"
        id="importFile"
        accept=".xlsx, .xls"
        onChange={handleImport}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <>
        <div className="table-container mt-4">
          <table className='table table-bordered table-hover align-middle text-center custom-table accessor-table'>
            <thead>
              <tr>
                <th>Sr No</th>
                <th className="special-yellow">Name</th>
                <th className="special-blue">Email</th>
                <th>Mobile</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Action</th>
              </tr>
            </thead>
            {students?.length === 0 ? (
              <div className="">No student available</div>
            ) : (
              <tbody>
                {students.map((student, index) => (
                  <>
                    <tr
                      key={student.email}
                      className='cursor-pointer'
                    >
                      <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{(currentPage - 1) * limit + index + 1}</td>
                      <td className="special-yellow">{student.name}</td>
                      <td className="special-blue">{student.email}</td>
                      <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{student.mobile}</td>
                      <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{formatDOB(student.dob)}</td>
                      <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{student.gender}</td>
                      <td className="position-relative" style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>
                        <ActionMenu
                          options={[
                            {
                              icon: 'Download_b.svg', // pick your icon file
                              title: 'Download Photo',
                              onClick: () => downloadSinglePhoto(student.studentId),
                              isLoading: isDownloading === student.studentId,
                            },
                            {
                              icon: 'material-symbols_edit-outline.svg',
                              title: 'View Detail',
                              onClick: () => handleViewDetails(student.studentId),
                            },
                            {
                              icon: 'material-symbols_delete-outline.svg',
                              title: 'Delete Student',
                              onClick: () => handleDelete(student.studentId),
                            },
                            ...(student.isProfile !== "Completed"
                              ? [{
                                icon: 'Import_b.svg',
                                title: 'Re-upload Photo',
                                onClick: () => triggerFileInput(student.studentId),
                                customRender: (
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    ref={(el) => fileInputRefs.current[student.studentId] = el}
                                    onChange={(e) => onFileChange(student.studentId, e)}
                                  />
                                )
                              }]
                              : []),
                          ].filter(Boolean)}
                        />

                      </td>
                    </tr>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={(el) => fileInputRefs.current[student.studentId] = el}
                      onChange={(e) => onFileChange(student.studentId, e)}
                    />
                  </>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* for view and edit the form  */}

        <Modal show={viewModal} onHide={handleCloseeModal} className="custom-modal" size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Student Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {studentData ? (
              <Form>
                <div className="row">
                  {/* Name */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Name"
                      type="text"
                      value={studentData.name}
                      onChange={(val) => handleChangeStudent({ target: { name: 'name', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Email */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Email"
                      type="email"
                      value={normalizeEmail(studentData.email)}
                      onChange={(val) => handleChangeStudent({ target: { name: 'email', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Mobile */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Mobile"
                      type="text"
                      value={studentData.mobile}
                      onChange={(val) => handleChangeStudent({ target: { name: 'mobile', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <Date_Picker
                      label="Date of Birth"
                      value={
                        studentData.dob
                          ? new Date(studentData.dob)
                          : null
                      }
                      onChange={(val) => handleChangeStudent({ target: { name: 'dob', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Occupation */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Occupation"
                      type="text"
                      value={studentData.occupation}
                      onChange={(val) => handleChangeStudent({ target: { name: 'occupation', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Address */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Address"
                      type="text"
                      value={studentData.address}
                      onChange={(val) => handleChangeStudent({ target: { name: 'address', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Qualification */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Qualification"
                      type="text"
                      value={studentData.qualification}
                      onChange={(val) => handleChangeStudent({ target: { name: 'qualification', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Gender */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Gender"
                      type="select"
                      value={studentData.gender}
                      onChange={(val) => handleChangeStudent({ target: { name: 'gender', value: val } })}
                      disabled={!isEditMode}
                      options={[
                        { label: 'Male', value: 'Male' },
                        { label: 'Female', value: 'Female' },
                        { label: 'Other', value: 'Other' },
                      ]}
                    />
                  </div>

                  {/* Blood Group */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Blood Group"
                      type="select"
                      value={studentData.bloodGrp}
                      onChange={(val) => handleChangeStudent({ target: { name: 'bloodGrp', value: val } })}
                      disabled={!isEditMode}
                      options={[
                        { label: 'Select', value: '' },
                        { label: 'A+', value: 'A+' },
                        { label: 'A-', value: 'A-' },
                        { label: 'B+', value: 'B+' },
                        { label: 'B-', value: 'B-' },
                        { label: 'O+', value: 'O+' },
                        { label: 'O-', value: 'O-' },
                        { label: 'AB+', value: 'AB+' },
                        { label: 'AB-', value: 'AB-' },
                      ]}
                    />
                  </div>

                  {/* Profile Photo */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <label><strong>Profile Photo:</strong></label>
                    <div className="row d-flex align-items-center">
                      {studentData.imagePath && (
                        <img
                          src={`${BASE_URL}/${studentData.imagePath}`}
                          alt="Profile"
                          style={{ width: '40px', height: '40px', marginRight: '10px', cursor: 'pointer' }}
                          onClick={() => handleImageClick(`${BASE_URL}/${studentData.imagePath}`)}
                        />
                      )}
                      {isEditMode && (
                        <div className="col-12">
                          <InputField
                            type="file"
                            name="imagePath"
                            onChange={(e) => handleFileChange(e, 'imagePath')}
                            accept="image/*"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Image */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <label><strong>Aadhaar Card:</strong></label>
                    <div className="d-flex align-items-center">
                      {studentData.adhaarImage && (
                        <img
                          src={`${BASE_URL}/${studentData.adhaarImage}`}
                          alt="Aadhaar Card"
                          style={{ width: '40px', height: '40px', marginRight: '10px', cursor: 'pointer' }}
                          onClick={() => handleImageClick(`${BASE_URL}/${studentData.adhaarImage}`)}
                        />
                      )}
                      {isEditMode && (
                        <div className="col-12">
                          <InputField
                            type="file"
                            name="adhaarImage"
                            onChange={(e) => handleFileChange(e, 'adhaarImage')}
                            accept="application/pdf, image/*"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Form>

            ) : (
              <p>Loading...</p>
            )}
            <div className="d-flex justify-content-end mt-4 mb-2 px-4 pb-4">
              <CustomButton
                title={isEditMode ? 'Save Changes' : 'Edit'}
                icon={isEditMode ? 'Save_w.svg' : 'Edit_Pencil_w.svg'}
                onClick={() => {
                  if (isEditMode) {
                    handleUpdate(studentData)
                  } else {
                    handleIsEdit()
                  }
                }}
              />
            </div>
          </Modal.Body>
        </Modal>

        {/* for student registration  */}

        <Modal show={showModal} onHide={handleCloseModal} className="custom-modal" size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Register Student</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <RegisterStudentForm />
          </Modal.Body>
        </Modal>
      </>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Toaster
        position="top-center"
        reverseOrder={true}
        toastOptions={{ duration: 2000 }}
      />
    </div>
  )
}

export default RegisteredStudentsTable

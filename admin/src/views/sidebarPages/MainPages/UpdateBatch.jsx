import React, { useState, useEffect, useRef } from 'react'
import { Table, Modal, Button, Form, Col, Row, Spinner } from 'react-bootstrap'
import * as XLSX from 'xlsx'
import toast, { Toaster } from 'react-hot-toast';

import '../../SidebarCss/Table.css' // Adjust CSS file path
import axios from 'axios'
import { BASE_URL } from '../../../BaseURL'
import { useNavigate, useLocation } from 'react-router-dom'
import InputField from '../../../components/custom/InputField';
import Date_Picker from '../../../components/custom/Date_Picker';
import CustomButton from '../../../components/custom/CustomButton';
import { formatName, toISODate } from '../../../utils/dataHelpers';
import LicenseDropdown from './LicenseDropdown';
import CertificateDropdown from './CertificateDropdown';

const UpdateBatch = ({ batchId, show, onClose, viewBatchFunc, viewBatch }) => {
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [uuid, setUuid] = useState(localStorage.getItem('uuid'))
  const navigate = useNavigate()
  const location = useLocation();
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const limit = 50
  const [certificates, setCertificates] = useState([])
  const [licenses, setLicenses] = useState([])
  const [selectedCertificate, setSelectedCertificate] = useState({
    certificateId: viewBatch?.certificateId,
    certificateName: '',
  })
  const [selectedLicense, setSelectedLicense] = useState({
    licenseId: viewBatch?.licenseId,
    licenseName: '',
  })
  const [batch, setBatch] = useState([])
  const [isEditable, setIsEditable] = useState(true)
  // Number of rows per page (both for main table and modal)

  const [trainers, setTrainers] = useState([])
  const [selectedTrainerId, setSelectedTrainerId] = useState('')

  const [accessors, setAccessors] = useState([])
  const [selectedAccessorId, setSelectedAccessorId] = useState('')

  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')


  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [updatedStudentIds, setUpdatedStudentIds] = useState(viewBatch.studentIds || [])

  const [validity, setValidity] = useState('')
  //fetch trainer for dropdown
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

  const fetchCertificate = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/certificate/getCertificateList`)
      const respData = response.data

      if (respData?.success) {
        setCertificates(respData?.certificateList || [])
        setSelectedCertificate({
          certificateId: selectedCertificate.certificateId,
          certificateName: respData?.certificateList?.find(cert => cert.certificateId == selectedCertificate.certificateId).certificateName
        })
      } else {
        setCertificates([])
      }
    } catch (error) {
      setCertificates([])
    }
  }
  const fetchLicense = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/license/getAll`)
      const respData = response.data

      if (respData?.success) {
        setLicenses(respData?.licenses || [])
        setSelectedLicense({
          licenseId: selectedLicense.licenseId,
          licenseName: respData?.licenses?.find(license => license.licenseId == selectedLicense.licenseId).licenseName,
        })
      } else {
        setLicenses([])
      }
    } catch (error) {
      setLicenses([])
    }
  }
  const fileInputRef = useRef(null);
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;


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
        else if (seenEmails.has(em)) errs.push('Email duplicate');
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
        else if (seenMobiles.has(mb)) errs.push('Mobile duplicate');
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
          viewBatchFunc(prev => {
            // Get all studentIds from students and existingStud
            const importedIds = res.data.students.map(s => s.studentId);
            const existingIds = (res.data.existingStud || []).map(s => s.studentId);
            // Only add existingIds that are not already in prev.studentIds
            const missingExisting = existingIds.filter(id => !(prev.studentIds || []).includes(id));
            console.log(missingExisting);
            return {
              ...prev,
              studentIds: [...new Set([...(prev.studentIds || []), ...importedIds, ...missingExisting])]
            };
          });
          toast.success(`Imported ${res.data.students.length} students`);
          toast.success(`Existing ${res.data.existingStud.length} students`);

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

  const handleImportStudent = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const [selectedAssessments, setSelectedAssessments] = useState({
    grade: false,
    meterDive: false,
  })

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setSelectedAssessments((prev) => ({
      ...prev,
      [name]: checked,
    }))
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
        // setTotalPages(respData?.totalPages)
      } else {
        toast.error(respData.message || 'No batch available')
      }
    } catch (error) {
      setBatch([])
      // setTotalPages(1)
    }
  }

  //handle edit popup onchange
  const handleEditChange = (e) => {
    const { name, value } = e.target
    viewBatchFunc((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  //handle edit
  const handleIsEdit = () => {
    setIsEditable(!isEditable);
    fetchTrainers()
    fetchAccessors()
    fetchCourses()
    fetchBranches()
  }
  useEffect(() => {
    // Your logic here (runs only once on mount)
    fetchTrainers()
    fetchAccessors()
    fetchCourses()
    fetchBranches()
    fetchCertificate()
    fetchLicense()
    setSelectedTrainerId(viewBatch?.trainerId || '')
    setSelectedAccessorId(viewBatch?.accessorId || '')
    setSelectedCourseId(viewBatch?.courseId || '')
    setSelectedBranch(viewBatch?.branchId || '')
    setValidity(viewBatch?.validity || 0)
    if (viewBatch?.validity) {
      setValidity(viewBatch.validity)
    } else {
      setValidity(0) // Default to 0 if not set
    }
    if (viewBatch?.studentIds) {
      viewBatchFunc((prev) => ({
        ...prev,
        studentIds: viewBatch.studentIds.map(s => typeof s === 'string' ? s : s.studentId)
      }))
    }
    if (viewBatch?.assessment) {
      setSelectedAssessments({
        grade: viewBatch.assessment.grade || false,
        meterDive: viewBatch.assessment.meterDive || false,
      });
    } else {
      setSelectedAssessments({
        grade: false,
        meterDive: false,
      });
    }
  }, []);
  //handle update
  const handleUpdate = async (batchId) => {
    try {
      const batchDetails = {
        validity: validity,
        batchName: viewBatch.batchName,
        branchId: selectedBranch,
        branch: branches.find((b) => b.branchId === selectedBranch)?.branchName,
        courseId: selectedCourseId,
        courseName: courses.find((course) => course.courseId === selectedCourseId)?.courseName,
        accessorId: selectedAccessorId,
        accessorName: accessors.find((accessor) => accessor.accessorId === selectedAccessorId)
          ?.accessorName,
        trainerId: selectedTrainerId,
        trainerName: trainers.find((trainer) => trainer.trainerId === selectedTrainerId)
          ?.trainerName,
        startDate: toISODate(viewBatch.startDate),
        endDate: toISODate(viewBatch.endDate),
        certificateId: selectedCertificate?.certificateId,
        licenseId: selectedLicense?.licenseId,
        assessment: {
          grade: selectedAssessments.grade || false,
          meterDive: selectedAssessments.meterDive || false,
        },
        status: viewBatch.status || 'On-Going',
        studentIds: viewBatch.studentIds.map(s => typeof s === 'string' ? s : s.studentId),
      }
      const response = await axios.put(`${BASE_URL}/batch/updateBatchById/${batchId}`, batchDetails);

      const respData = response.data

      if (respData?.success) {
        toast.success(respData?.message || 'Batch detail updated successfully', {
          position: 'top-center',
        })
        getBatchDtl(1)
        navigate('/batchmembers', { state: { studIdsList: (viewBatch.studentIds || []).map(s => typeof s === 'string' ? s : s.studentId), batchId: batchId }, })
        onClose()
      } else {
        toast.error(respData?.message || 'Fail to update details', { position: 'top-center' })
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error(error?.response?.data?.message || 'Internal server error. Try after some time.')
    }
  }

  const handleAddStudents = () => {
    navigate('/add-batch-students', {
      state: {
        batchId: viewBatch.batchId,
        existingStudentIds: viewBatch.studentIds || [],
      },
    });
  };

  useEffect(() => {
    if (location.state && location.state.newStudents) {
      // Merge new students into viewBatch.studentIds
      const newStudentIds = location.state.newStudents.map(s => s.studentId);
      viewBatchFunc(prev => ({
        ...prev,
        studentIds: [...new Set([...(prev.studentIds || []), ...newStudentIds])].map(s => typeof s === 'string' ? s : s.studentId)
      }));
      // Optionally, update batch on server here or wait for Save
    }
  }, [location.state]);

  return (
    <>

      <Modal show={show} onHide={onClose} className="custom-modal" size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Batch Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className='row'>
              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <InputField
                  label="Batch Name"
                  value={viewBatch?.batchName}
                  onChange={(val) =>
                    handleEditChange({ target: { name: 'batchName', value: val } })
                  }
                  readOnly={isEditable}
                />
              </div>
              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <InputField
                  label="Student Count"
                  value={viewBatch.studentIds?.length || 0}
                  readOnly
                />
              </div>

              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <Date_Picker
                  label="Start Date"
                  value={viewBatch?.startDate ? new Date(viewBatch.startDate) : null}
                  onChange={(val) =>
                    handleEditChange({ target: { name: 'startDate', value: val } })
                  }
                />
              </div>
              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <Date_Picker
                  label="End Date"
                  value={viewBatch?.endDate ? new Date(viewBatch?.endDate) : null}
                  onChange={(val) =>
                    handleEditChange({ target: { name: 'endDate', value: val } })
                  }
                />
              </div>

              <div className="col-md-6 col-lg-8 col-12 px-3 pb-4">
                <InputField
                  label="Course Name"
                  type="select"
                  value={isEditable ? `${viewBatch.courseId}` : selectedCourseId}
                  onChange={setSelectedCourseId}
                  disabled={isEditable}
                  options={courses?.map((c) => ({
                    label: c.courseName,
                    value: c.courseId,
                  }))}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
                <CertificateDropdown
                  disabled={isEditable}
                  className="mb-0"
                  certificates={certificates}
                  selectedCertificate={selectedCertificate}
                  setSelectedCertificate={setSelectedCertificate}
                />
              </div>



              <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
                <LicenseDropdown
                  disabled={isEditable}
                  className="mb-0"
                  licenses={licenses}
                  selectedlicense={selectedLicense}
                  setSelectedlicense={setSelectedLicense}
                />
              </div>
              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <InputField
                  label="Status"
                  type="select"
                  value={viewBatch.status}
                  onChange={(val) => viewBatchFunc({ ...viewBatch, status: val })}
                  options={[
                    { label: 'Completed', value: 'Completed' },
                    { label: 'On-Going', value: 'On-Going' },
                    { label: 'Coming Soon', value: 'Coming Soon' },
                  ]}
                  disabled={isEditable}
                />
              </div>

              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <InputField
                  label="Validity"
                  type="select"
                  value={isEditable ? viewBatch.validity : validity}
                  onChange={setValidity}
                  disabled={isEditable}
                  options={[
                    { label: 'One Year', value: 1 },
                    { label: 'Two Year', value: 2 },
                    { label: 'Five Year', value: 5 },
                    { label: 'Lifetime', value: 0 },
                  ]}
                />
              </div>
              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <InputField
                  label="Branch"
                  type="select"
                  value={isEditable ? viewBatch.branchId : selectedBranch}
                  onChange={setSelectedBranch}
                  disabled={isEditable}
                  options={branches?.map((b) => ({
                    label: b.branchName,
                    value: b.branchId,
                  }))}
                />
              </div>

              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <InputField
                  label="Trainer"
                  type="select"
                  value={isEditable ? `${viewBatch.trainerId}` : selectedTrainerId}
                  onChange={setSelectedTrainerId}
                  disabled={isEditable}
                  options={trainers?.map((t) => ({
                    label: t.trainerName,
                    value: t.trainerId,
                  }))}
                />
              </div>
              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <InputField
                  label="Examiner"
                  type="select"
                  value={isEditable ? viewBatch.accessorId : selectedAccessorId}
                  onChange={setSelectedAccessorId}
                  disabled={isEditable}
                  options={accessors?.map((a) => ({
                    label: a.accessorName,
                    value: a.accessorId,
                  }))}
                />
              </div>


              <div className="col-md-6 col-lg-4 col-12 px-3 pb-4">
                <Form.Group>
                  <label style={{ fontSize: '14px' }} className="mb-0 pb-2">Select Assessment (Optional)</label>
                  <div className=''>
                    <Form.Check
                      style={{ fontSize: '14px' }}
                      type="checkbox"
                      label="Grade"
                      name="grade"
                      checked={selectedAssessments.grade}
                      onChange={handleCheckboxChange}
                      inline
                    />
                    <Form.Check
                      style={{ fontSize: '14px' }}
                      type="checkbox"
                      label="Meter Dive"
                      name="meterDive"
                      checked={selectedAssessments.meterDive}
                      onChange={handleCheckboxChange}
                      inline
                    />
                  </div>
                </Form.Group>
              </div>

              {role === 'admin' && (
                <>
                  {!isEditable ? (
                    <div className='col-12 d-flex justify-content-end'>
                      <div className="px-3 pb-4">
                        <CustomButton
                          title="Add Students"
                          onClick={handleAddStudents}
                          icon="File_Download_b.svg"
                          variant='outline'
                        />
                      </div>
                      <div className="px-3 pb-4">
                        <CustomButton
                          title="Import Students"
                          onClick={handleImportStudent}
                          icon="Import_b.svg"
                          variant='outline'
                        // color="green"
                        />
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  ) : <></>}
                  <div className="col-12 px-3 pb-4 d-flex justify-content-end">
                    <CustomButton
                      title={isEditable ? 'Edit' : 'Save Changes'}
                      icon={isEditable ? 'Edit_Pencil_w.svg' : 'Save_w.svg'}
                      onClick={() => {
                        if (isEditable) {
                          handleIsEdit();
                        } else {
                          handleUpdate(viewBatch?.batchId);
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </>
  )
}

export default UpdateBatch

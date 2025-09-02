import React, { useState, useEffect, useRef } from 'react'
import { Table, Form, Row, Col, Button } from 'react-bootstrap'
import axios from 'axios'
import * as XLSX from 'xlsx'
import '../../SidebarCss/Table.css'
import { BASE_URL } from '../../../BaseURL'
import toast, { Toaster } from 'react-hot-toast';

import { useNavigate } from 'react-router-dom'
import CertificateDropdown from './CertificateDropdown'
import LicenseDropdown from './LicenseDropdown'
import Date_Picker from '../../../components/custom/Date_Picker'
import InputField from '../../../components/custom/InputField'
import CustomButton from '../../../components/custom/CustomButton'
import { formatName, toISODate } from '../../../utils/dataHelpers'

const CreateNewBatch = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([])
  const [trainers, setTrainers] = useState([])
  const [accessors, setAccessors] = useState([])
  const [courses, setCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 50
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectedTrainerId, setSelectedTrainerId] = useState('')
  const [selectedAccessorId, setSelectedAccessorId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [batchName, setBatchName] = useState('')
  const [batchCode, setBatchCode] = useState('')
  const [validity, setValidity] = useState('')
  const [branch, setBranch] = useState('')
  const [branches, setBranches] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState({
    catId: '',
    catName: '',
  })
  const [certificates, setCertificates] = useState([])
  const [licenses, setLicenses] = useState([])
  const [selectedCertificate, setSelectedCertificate] = useState({
    certificateId: '',
    certificateName: '',
  })
  const [selectedLicense, setSelectedLicense] = useState({
    licenseId: '',
    licenseName: '',
  })
  const [selectedAssessments, setSelectedAssessments] = useState({
    grade: false,
    meterDive: false,
  })

  const fileInputRef = useRef(null);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setSelectedAssessments((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/student/getRegisteredStud`, {
        params: { page: currentPage, limit: 15, searchTerm },
      })
      const respData = response?.data
      if (respData?.success) {
        const { studentDtl, totalPages } = respData
        setStudents(studentDtl || [])
        setTotalPages(totalPages)
      }
    } catch (error) {
      setStudents([])
      setTotalPages(1)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/trainer/getTrainerList`)
      const { trainers } = response.data

      setTrainers(trainers || []) // Ensure trainers is an array
    } catch (error) {
      setTrainers([])
    }
  }

  const fetchAccessors = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/accessor/getAccessorList`)
      const respData = response.data

      if (respData?.success) {
        setAccessors(respData?.accessors || [])
      }
    } catch (error) {
      setAccessors([])
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
      setCourses([])
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/category/getCatDropdown`)
      const respData = response.data

      if (respData?.success) {
        setCategories(respData?.gategories || [])
      }
    } catch (error) {
      setCategories([])
    }
  }

  const fetchCertificate = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/certificate/getCertificateList`)
      const respData = response.data

      if (respData?.success) {
        setCertificates(respData?.certificateList || [])
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
      }
    } catch (error) {
      setLicenses([])
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/branch/getAllBranches`)
      const respData = response.data

      if (respData?.success) {
        setBranches(respData?.branchesList || [])
      } else {
        toast.error('Failed to fetch branches.')
      }
    } catch (error) {
      setBranches([])
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [currentPage, searchTerm])

  useEffect(() => {
    // ...other fetches...
    fetchTrainers()
    fetchAccessors()
    fetchCourses()
    fetchBranches()
    fetchCategories()
    fetchCertificate()
    fetchLicense()
  }, [])

  //create batch
  const handleSubmitBatch = async () => {
    try {
      if (selectedStudents.length === 0) {
        toast.error('Students not selected. Please select students.')
      }

      if (!batchName) {
        toast.error('Please enter batch name.')
        return
      }

      if (!validity) {
        toast.error('Please select validity.')
        return
      }

      if (!branch) {
        toast.error('Please select branch')
        return
      }

      if (!selectedCertificate?.certificateId) {
        toast.error('Please select certificate.')
        return
      }

      // if (!selectedLicense?.licenseId) {
      //   toast.error('Please select License.')
      //   return
      // }

      if (!startDate) {
        toast.error('Please enter start date.')
        return
      }

      if (!endDate) {
        toast.error('Please enter end date.')
        return
      }

      if (!selectedTrainerId) {
        toast.error('Please select trainer.')
        return
      }

      if (!selectedAccessorId) {
        toast.error('Please select examiner.')
        return
      }

      if (!selectedCourseId) {
        toast.error('Please select course.')
        return
      }

      const batchDetails = {
        validity,
        batchName,
        branch: branches.find((b) => b.branchId === branch)?.branchName,
        branchId: branch,
        courseId: selectedCourseId,
        courseName: courses.find((course) => course.courseId === selectedCourseId)?.courseName,
        categoryId: selectedCategory.catId,
        courseCat: selectedCategory.catName,
        accessorId: selectedAccessorId,
        accessorName: accessors.find((accessor) => accessor.accessorId === selectedAccessorId)
          ?.accessorName,
        trainerId: selectedTrainerId,
        trainerName: trainers.find((trainer) => trainer.trainerId === selectedTrainerId)
          ?.trainerName,
        startDate: startDate,
        endDate: endDate,
        certificateId: selectedCertificate?.certificateId,
        licenseId: selectedLicense?.licenseId,
        studentList: selectedStudents?.map((student) => ({ studentId: student.studentId })),
        selectedAssessments,
      }

      const response = await axios.post(`${BASE_URL}/batch/createBatch`, batchDetails)
      const respData = response.data

      if (respData?.success) {
        toast.success(respData?.message || 'Batch created successfully')
        setSelectedStudents([])
        setBatchName('')
        setValidity('')
        setBranch('')
        setStartDate('')
        setEndDate('')
        setSelectedTrainerId('')
        setSelectedAccessorId('')
        setSelectedCourseId('')
        setSelectedCertificate({
          certificateId: '',
          certificateName: '',
        })
        setSelectedCategory({
          catId: '',
          catName: '',
        })
        setSelectedAssessments({
          grade: false,
          meterDive: false,
        })
      }
      navigate('/all-batch'); // Redirect to batch list after successful creation
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try again.')
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // --- Import Students from Excel ---
  const handleImportStudent = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };


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


  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      const [headerRow, ...rows] = rawRows;

      // Map headers
      const headerMap = headerRow.reduce((map, col, idx) => {
        map[col.trim().toLowerCase()] = idx;
        return map;
      }, {});
      const requiredColumns = ['name', 'email', 'dob', 'gender', 'mobile', 'occupation', 'qualification', 'address', 'bloodgrp'];
      for (const col of requiredColumns) {
        if (!(col in headerMap)) {
          toast.error(`Missing column: ${col}`);
          return;
        }
      }

      const imported = [];
      const failed = [];
      const seenEmails = new Set();
      const seenMobiles = new Set();

      rows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const empty = requiredColumns.every(c => !String(row[headerMap[c]]).trim());
        if (empty) return;

        const record = {};
        const errors = [];
        const fieldError = (f, msg) => errors.push(`${f}: ${msg}`);

        // Name
        const nm = String(row[headerMap['name']]).trim();
        if (!nm) fieldError('Name', 'required');
        record.name = nm ? formatName(nm) : '';

        // Email
        const em = String(row[headerMap['email']]).trim().toLowerCase();
        if (!em) fieldError('Email', 'required');
        else if (!/^[^@]+@[^@]+\.[^@]+$/.test(em)) fieldError('Email', 'invalid format');
        else if (seenEmails.has(em)) fieldError('Email', 'duplicate');
        record.email = em;

        // DOB
        const rawDob = String(row[headerMap['dob']]).trim();
        try {
          if (!rawDob) throw new Error('required');
          const dt = parseDateString(rawDob);
          record.dob = toISODate(dt);
        } catch (ex) {
          fieldError('DOB', ex.message === 'required' ? 'required' : 'invalid date');
        }

        // Gender
        const gd = String(row[headerMap['gender']]).trim().toLowerCase();
        if (!['male', 'female', 'other'].includes(gd)) fieldError('Gender', 'must be Male/Female/Other');
        record.gender = gd;

        // Mobile
        const mb = String(row[headerMap['mobile']]).trim();
        if (!mb) fieldError('Mobile', 'required');
        else if (!/^[1-9]\d{9}$/.test(mb)) fieldError('Mobile', 'invalid format');
        else if (seenMobiles.has(mb)) fieldError('Mobile', 'duplicate');
        record.mobile = mb;

        // Optional fields
        record.occupation = String(row[headerMap['occupation']]).trim();
        record.qualification = String(row[headerMap['qualification']]).trim();
        record.address = String(row[headerMap['address']]).trim();

        // BloodGrp
        const bg = String(row[headerMap['bloodgrp']]).trim().toUpperCase();
        if (bg && !/^(A|B|AB|O)[+-]$/.test(bg)) fieldError('BloodGrp', 'invalid');
        record.bloodGrp = bg;

        if (errors.length) {
          failed.push({ row: rowNum, errors });
        } else {
          seenEmails.add(em);
          seenMobiles.add(mb);
          imported.push(record);
        }
      });

      // Toast errors
      failed.forEach(f => toast.error(`Row ${f.row}: ${f.errors.join(', ')}`, { autoClose: false }));

      if (!imported.length) {
        toast.error('No valid records to import.');
        return;
      }

      try {
        const resp = await axios.post(`${BASE_URL}/student/import`, { students: imported });
        if (resp.data.success) {
          const importedIds = resp.data.students.map(s => s.studentId);
          const existingIds = (resp.data.existingStud || []).map(s => s.studentId);
          const missingExisting = existingIds.filter(id => !importedIds.includes(id));
          setSelectedStudents([...new Set([...importedIds, ...missingExisting])].map(id => ({ studentId: id })));
          toast.success(`Imported ${resp.data.students.length} students.`);
          toast.success(`Existing ${resp.data.existingStud.length} students.`);
        }
        else toast.error(resp.data.message || 'Server import error');
      } catch {
        toast.error('Failed to import to server.');
      }

    } catch (err) {
      console.error(err);
      toast.error('Invalid Excel file.');
    }
  };
  // --- End Import Students ---

  return (
    <div className="container shadow p-5 rounded mt-4" style={{ backgroundColor: "White", width: "80%" }}>
      <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '4%', fontSize: "28px" }}>Create Batch</h4>
      <Form>
        <div className="row">
          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <InputField
              label="Batch Name"
              type="text"
              placeholder="Enter batch name"
              value={batchName}
              onChange={(val) => setBatchName(val)}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <InputField
              label="Validity"
              type="select"
              value={validity}
              onChange={(val) => setValidity(val)}
              options={[
                { label: "Select", value: "" },
                { label: "One Year", value: 1 },
                { label: "Two Year", value: 2 },
                { label: "Five Year", value: 5 },
                { label: "Lifetime", value: 100 },
              ]}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <InputField
              label="Branch"
              type="select"
              value={branch}
              onChange={(val) => setBranch(val)}
              options={[
                { label: "Select Branch", value: "" },
                ...branches?.map((b) => ({
                  label: b.branchName,
                  value: b.branchId,
                })),
              ]}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <Date_Picker
              label="Start Date"
              value={startDate}
              placeholder="Select start date"
              onChange={(val) => setStartDate(val)}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <Date_Picker
              label="End Date"
              value={endDate}
              placeholder="Select end date"
              onChange={(val) => setEndDate(val)}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <InputField
              label="Course Name"
              type="select"
              value={selectedCourseId}
              onChange={(val) => setSelectedCourseId(val)}
              options={[
                { label: "Select Course", value: "" },
                ...courses?.map((c) => ({
                  label: c.courseName,
                  value: c.courseId,
                })),
              ]}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <CertificateDropdown
              className="mb-0"
              certificates={certificates}
              selectedCertificate={selectedCertificate}
              setSelectedCertificate={setSelectedCertificate}
            />
          </div>



          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <LicenseDropdown
              className="mb-0"
              licenses={licenses}
              selectedlicense={selectedLicense}
              setSelectedlicense={setSelectedLicense}
            />
          </div>





          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <InputField
              label="Trainer"
              type="select"
              value={selectedTrainerId}
              onChange={(val) => setSelectedTrainerId(val)}
              options={[
                { label: "Select Trainer", value: "" },
                ...trainers?.map((t) => ({
                  label: `${t.trainerName} (${t.trainerMobNo})`,
                  value: t.trainerId,
                })),
              ]}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
            <InputField
              label="Examiner"
              type="select"
              value={selectedAccessorId}
              onChange={(val) => setSelectedAccessorId(val)}
              options={[
                { label: "Select Examiner", value: "" },
                ...accessors?.map((a) => ({
                  label: `${a.accessorName} (${a.accessorMobNo})`,
                  value: a.accessorId,
                })),
              ]}
            />
          </div>

          <div className="col-12 col-md-4">
            <label style={{ fontSize: '14px' }} className="px-3 form-label">Select Assessment (Optional)</label>
            <div className='px-3'>
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
                label="meterDive"
                name="meterDive"
                checked={selectedAssessments.meterDive}
                onChange={handleCheckboxChange}
                inline
              />
            </div>
            <div className="opacity-0">
              <input
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                style={{ display: 'none' }}
              // onChange={handleFileChange}
              />
            </div>
          </div>


        </div>
        <div className="row">
          <div className="col-12 col-md-12 mt-4 d-flex justify-content-end">
            <div className='mx-3'>
              <CustomButton
                variant="outline"
                icon="Import_b.svg"
                title='Import Students'
                onClick={handleImportStudent}
              />

              <input
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            <CustomButton
              title="Create Batch"
              icon="tabler_plus.svg"
              onClick={handleSubmitBatch}
            />
          </div>


        </div>
      </Form>

      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  )
}

export default CreateNewBatch

// ********

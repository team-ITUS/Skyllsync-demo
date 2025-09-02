import React, { useState, useEffect } from 'react'
import { Table, Form, Row, Col, Button, Modal } from 'react-bootstrap'
import axios from 'axios'
import '../../SidebarCss/Table.css'
import { BASE_URL } from '../../../BaseURL'
import toast, { Toaster } from 'react-hot-toast';

import { useLocation, useNavigate } from 'react-router-dom'

import CertificateDropdown from './CertificateDropdown'
import InputField from '../../../components/custom/InputField'
import CustomButton from '../../../components/custom/CustomButton'
import Pagination from '../../../components/custom/Pagination'

const CreateNewBatch = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const batchId = location.state?.batchId
  const existingStudentIds = location.state?.existingStudentIds || []

  const [students, setStudents] = useState([]) // Default to empty array
  const [trainers, setTrainers] = useState([]) // Default to empty array
  const [accessors, setAccessors] = useState([]) // Default to empty array
  const [courses, setCourses] = useState([]) // Default to empty array
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 30
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

  // const [certificateId, setCertificateId] = useState('');
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState({
    catId: '',
    catName: '',
  })

  const [certificates, setCertificates] = useState([])
  const [selectedCertificate, setSelectedCertificate] = useState({
    certificateId: '',
    certificateName: '',
  })

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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/student/getRegisteredStud`, {
        params: { page: currentPage, limit: limit, searchTerm },
      })
      const respData = response?.data

      if (respData?.success) {
        const { studentDtl, totalPages } = respData
        setStudents(studentDtl || [])
        setTotalPages(totalPages)
        // setSelectedStudents([])
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
    fetchTrainers()
    fetchAccessors()
    fetchCourses()
    fetchBranches()
    fetchCategories()
    fetchCertificate()
  }, [])

  const handleSelectStudent = (studentId) => {
    const updatedSelection = selectedStudents.some((student) => student.studentId === studentId)
      ? selectedStudents.filter((student) => student.studentId !== studentId)
      : [
          ...selectedStudents,
          {
            studentId,
            studentName: students.find((student) => student.studentId === studentId)?.name,
          },
        ]

    setSelectedStudents(updatedSelection)
  }

  // const handleSelectAll = (event) => {
  //   if (event.target.checked) {
  //     const selectedArray = students?.map((student) => ({
  //       studentId: student.studentId,
  //       studentName: student.name,
  //       // courseId: student.enrolledCourseId
  //     }))
  //     setSelectedStudents(selectedArray)
  //   } else {
  //     setSelectedStudents([])
  //   }
  // }

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const selectedArray = filteredStudents?.map((student) => ({
        studentId: student.studentId,
        studentName: student.name,
      }))

      // Merge with previously selected students (avoiding duplicates)
      const newSelected = [
        ...selectedStudents,
        ...selectedArray.filter(
          (newStu) => !selectedStudents.some((sel) => sel.studentId === newStu.studentId),
        ),
      ]

      setSelectedStudents(newSelected)
    } else {
      // Unselect only current page students
      const remainingSelected = selectedStudents.filter(
        (sel) => !filteredStudents.some((fs) => fs.studentId === sel.studentId),
      )
      setSelectedStudents(remainingSelected)
    }
  }

  //create batch
  const handleSubmitBatch = async () => {
    try {
      if (selectedStudents.length === 0) {
        toast.error('Please select students.')
        return
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
        startDate,
        endDate,
        certificateId: selectedCertificate?.certificateId,
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

      setShowModal(false)
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

  return (
    <div className="mainTableContainer">
      <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>Add Students Into Batch</h4>

      <div className='row' style={{ marginBottom: '15px', justifyContent: 'space-between', alignItems: 'center' }}>
  <div className='col-lg-4 col-md-6 col-12' style={{ textAlign: 'left' }}>
    <InputField
      type="text"
      label='Search By'
      placeholder="Search by Name, Email, Mobile"
      value={searchTerm}
      onChange={(val) => setSearchTerm(val)}
    />
  </div>

  <div className='col-lg-4 col-md-6 col-12 mt-4 d-flex justify-content-end' style={{ textAlign: 'right' }}>
    <CustomButton
      title="Add To Batch"
      className="comAddBtn"
      icon="tabler_plus.svg"
      size="sm"
      onClick={async () => {
        if (selectedStudents.length === 0) {
          toast.error('Please select students to add.');
          return;
        }

        try {
          const batchResponse = await axios.get(`${BASE_URL}/batch/getBatchById/${batchId}`);
          const batchData = batchResponse.data?.batchDtl;

          const existingIds = Array.isArray(batchData?.studentIds)
            ? batchData.studentIds.map(s => typeof s === 'string' ? s : s.studentId)
            : [];

          const newIds = selectedStudents.map(s => s.studentId);
          const mergedIds = Array.from(new Set([...existingIds, ...newIds]));

          const response = await axios.put(
            `${BASE_URL}/batch/updateBatchById/${batchId}`,
            { studentIds: mergedIds }
          );

          if (response.data.success) {
            toast.success('Students added to batch!');
            navigate(-1);
          } else {
            toast.error(response.data.message || 'Failed to add students.');
          }
        } catch (error) {
          toast.error(error?.response?.data?.message || 'Failed to add students.');
        }
      }}
    />
  </div>
</div>


      <div className="table-container mt-4">
        <table className='table table-bordered table-hover align-middle text-center custom-table accessor-table'>
          <thead>
            <tr>
              <th>
                <Form.Check
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    filteredStudents.every((student) =>
                      selectedStudents.some((sel) => sel.studentId === student.studentId),
                    ) && filteredStudents.length > 0
                  }
                  ref={(input) => {
                    if (input) {
                      const selectedOnPage = filteredStudents.filter((student) =>
                        selectedStudents.some((sel) => sel.studentId === student.studentId),
                      ).length
                      input.indeterminate =
                        selectedOnPage > 0 && selectedOnPage < filteredStudents.length
                    }
                  }}
                />
              </th>
              <th>Sr No</th>
              <th className="special-yellow">Full Name</th>
              <th className="special-blue">Email</th>
              <th>Mobile Number</th>
              <th>Registered On</th>
              {/* <th>Action</th> */}
            </tr>
          </thead>
          {filteredStudents?.length === 0 ? (
            <div>No student available</div>
          ) : (
            <tbody>
              {filteredStudents?.map((student, index) => (
                <tr key={student.studentId}>
                  <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>
                    <Form.Check
                      type="checkbox"
                      checked={selectedStudents.some(
                        (selected) => selected.studentId === student.studentId,
                      )}
                      onChange={() =>
                        handleSelectStudent(student?.studentId)
                      }
                    />
                  </td>
                  <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{(currentPage - 1) * limit + index + 1}</td>
                  <td className="special-yellow">{student.name}</td>
                  <td className="special-blue" title={student.email}>{student?.email}</td>
                  <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{student?.mobile}</td>
                  <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{formatDate(student?.registedDate)}</td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <Toaster
  position="top-center"
  reverseOrder={true}
/>
    </div>
  )
}

export default CreateNewBatch

// ********

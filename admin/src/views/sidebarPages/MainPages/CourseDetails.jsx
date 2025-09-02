import React, { useEffect, useState } from 'react'
import { Table, Form, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaPencilAlt, FaTrash, FaBook } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import '../../SidebarCss/Table.css'
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { BASE_URL } from '../../../BaseURL'
import Date_Picker from '../../../components/custom/Date_Picker'
import InputField from '../../../components/custom/InputField'
import ActionMenu from '../../../components/custom/ActionMenu'
import CustomButton from '../../../components/custom/CustomButton'
import Pagination from '../../../components/custom/Pagination'

const CourseDetails = () => {
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [courses, setCourses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 50
  const navigate = useNavigate()

  const [searchName, setSearchName] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleEdit = (course) => {
    navigate('/update-course', { state: { course } })
  }

  const handleDeleteCourse = async (courseId) => {
    const result = await MySwal.fire({
      title: 'Delete This Course?',
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
        // Send DELETE request to backend
        const response = await axios.delete(`${BASE_URL}/course/deleteCourseById/${courseId}`)
        const resData = response.data
        if (resData?.success) {
          getAllCourses(currentPage)
          // Show success toast
          toast.success('Course deleted successfully!')
        }
      } catch (error) {
        // Show error toast in case of network issues or any other error

        toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
      }
    }

  }

  const handleNavigate = (courseId, courseName) => {
    navigate('/add-section', { state: { courseId, courseName } })
  }

  const getAllCourses = async (currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/course/getAllCourseList`, {
        params: {
          page: currentPage,
          limit,
          status: statusFilter !== 'all' ? statusFilter : '',
          fromDate: dateFrom,
          toDate: dateTo,
          search: searchName,
        },
      })
      const respData = response.data

      if (respData?.success) {
        setCourses(respData?.coursesList)
        setTotalPages(respData?.totalPages)
      }
    } catch (error) {
      setCourses([])
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

  const handlePageChange = (page) => {
    setCurrentPage(page)
    getAllCourses(page)
  }

  //icon stylling start
  const editSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: '#497AE5',
    padding: '4px',
    borderRadius: '4px',
    color: 'white',
    marginRight: '4px',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }

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
    marginLeft: '4px'
  }

  const bookSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: '#02AA39',
    padding: '4px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }

  //icon stylling end

  useEffect(() => {
    // fetchTasks();
    getAllCourses(currentPage)
  }, [statusFilter, dateFrom, dateTo, searchName])

  return (
    <div className="mainTableContainer">
      <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>All Courses</h4>

      <div className="row mb-2 d-flex align-items-center">
        <div className='col-lg-3 d-flex justify-content-start'>
          <div style={{ width: "95%" }}>


            <InputField
              label="Search By"
              type="text"
              value={searchName}
              onChange={(val) => setSearchName(val)}
              placeholder="Search by course, creator"
            />
          </div>
        </div>

        <div className='col-lg-2 d-flex justify-content-start'>
          <div style={{ width: "95%" }}>


            <InputField
              label="Course Level"
              type="select"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Beginner', value: 'beginner' },
                { label: 'Intermediate', value: 'intermediate' },
                { label: 'Advanced', value: 'advanced' },
              ]}
            />
          </div>
        </div>

        <div className='col-lg-2 d-flex justify-content-start'>
          <div style={{ width: "95%" }}>


            <Date_Picker
              label="From Date"
              value={dateFrom}
              placeholder="From date"
              onChange={(val) => setDateFrom(val)}
            />
          </div>
        </div>

        <div className='col-lg-2 d-flex justify-content-start'>
          <div style={{ width: "95%" }}>


            <Date_Picker
              label="To Date"
              value={dateTo}
              placeholder="To date"
              onChange={(val) => setDateTo(val)}
            />
          </div>
        </div>

        <div className='col-lg-3 mt-4 d-flex justify-content-end'>
          <CustomButton title="Create Course" icon="tabler_plus.svg" onClick={() => navigate("/create-course")} />
        </div>
      </div>


      <div className="table-responsive mt-4">
        <table className="table table-bordered table-hover align-middle text-center custom-table accessor-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th className="special-yellow">Course Name</th>
              <th className="special-blue">Creator Name</th>
              <th>Creation Date</th>
              <th>Course Level</th>
              {/* <th>Course Category</th> */}
              <th>Action</th>
            </tr>
          </thead>
          {courses?.length === 0 ? (
            <div className="">No course available</div>
          ) : (
            <tbody>
              {courses?.map((course, index) => (
                <tr key={course.courseId}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td className="special-yellow">{course.courseName}</td>
                  <td className="special-blue">{course.creatorName}</td>
                  <td>{formatDate(course.createDate)}</td>
                  <td>{course.courseLevel?.toUpperCase()}</td>
                  {/* <td>{course.courseCategory}</td> */}
                  <td>
                    <ActionMenu
                      options={[
                        {
                          icon: 'material-symbols_edit-outline.svg',
                          title: 'Edit Course',
                          onClick: () => handleEdit(course),
                        },
                        {
                          icon: 'File_Download_b.svg',
                          title: 'Add Section',
                          onClick: () => handleNavigate(course.courseId, course.courseName),
                        },
                        ...(role !== 'trainer'
                          ? [{
                            icon: 'material-symbols_delete-outline.svg',
                            title: 'Delete Course',
                            onClick: () => handleDeleteCourse(course.courseId),
                          }]
                          : []),
                      ].filter(Boolean)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  )
}

export default CourseDetails

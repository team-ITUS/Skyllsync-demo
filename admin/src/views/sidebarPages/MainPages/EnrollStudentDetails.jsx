import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../SidebarCss/Table.css';
import { BASE_URL } from '../../../BaseURL';
import { FaTrash } from 'react-icons/fa';
import { Table, Form, Row, Col, OverlayTrigger, Tooltip, Button, Modal, Dropdown } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

import 'react-toastify/dist/ReactToastify.css';
import Pagination from '../../../components/custom/Pagination';

const EnrollStudentDetails = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const limit = 50;

  // Fetch registered students from the backend
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/student/registered-students`, {
        params: { page: currentPage, limit }
      });
      setStudents(response.data.students);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all courses
  const getAllCourses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/course/getAllCourses`);
      if (response.data.success) {
        setCourses(response.data.coursesList);
      } else {
        toast.error(response.data.message || "Courses not available");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try again later.');
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
        await axios.delete(`${BASE_URL}/student/delete-student/${studentId}`);
        setStudents((prevStudents) => prevStudents.filter((student) => student.studentId !== studentId));
        toast.success('Student deleted successfully!');
      } catch (err) {
        console.error('Error deleting student:', err);
        toast.error('Failed to delete student. Please try again.');
      }
    }
  };

  // Handle selection of individual checkboxes
  const handleSelectStudent = (studentId) => {
    const updatedSelection = selectedStudents.some(student => student.studentId === studentId)
      ? selectedStudents.filter(student => student.studentId !== studentId)
      : [...selectedStudents, { studentId, studentName: students.find(student => student.studentId === studentId)?.name }];

    setSelectedStudents(updatedSelection);
  };

  // Handle the select all checkbox
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const selectedArray = students.map(student =>{
        if(student.isProfile !== "Rejected"){
          return ({
            studentId: student.studentId,
            studentName: student.name
          });
        }
      });
      setSelectedStudents(selectedArray);
    } else {
      setSelectedStudents([]); // Clear selection
    }
  };

  // Handle enrollment
  const handleEnroll = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course before enrolling.");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/enroll/enrollMultipleStd`, {
        courseId: selectedCourse,
        courseName: courses.find(course => course.courseId === selectedCourse)?.courseName || '',
        studentList: selectedStudents
      });

      if (response.data.success) {
        toast.success('Students enrolled successfully!');
        setSelectedStudents([]); // Clear selection
        setShowModal(false);
        fetchStudents();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to enroll students. Try again.');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);

  useEffect(() => {
    if (showModal) {
      getAllCourses();
    }
  }, [showModal]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className='mainTableContainer'>
      <h4 style={{ textAlign: "center", color: "black", marginBottom: "3%", fontSize: "28px" }}>Enroll Students</h4>

      <Row style={{ marginBottom: '15px', justifyContent: 'space-between', alignItems: 'center' }}>
        <Col xs={4} style={{ textAlign: 'left' }}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', display: 'inline-block', maxWidth: '200px' }}
            />
          </Form.Group>
        </Col>
        <Col xs={4} style={{ textAlign: 'right' }}>
          <Button variant="dark" size="sm" onClick={() => setShowModal(true)}>Enroll</Button>
        </Col>
      </Row>

      <div className="container mt-4 rounded-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="table table-bordered table-hover align-middle text-center custom-table accessor-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: "center" }}>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-top">Select all</Tooltip>}
                >
                  <Form.Check
                    type="checkbox"
                    checked={students.length > 0 && selectedStudents.length === students.length}
                    onChange={handleSelectAll}
                    style={{ margin: '0' }}
                  />
                </OverlayTrigger>
              </th>
              <th>Sr No</th>
              <th className="special-yellow">Name</th>
              <th className="special-blue">Email</th>
              <th>Mobile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.studentId}>
                <td style={{ textAlign: 'center' }}>
                  <Form.Check
                    type="checkbox"
                    checked={selectedStudents.some(selected => selected.studentId === student.studentId)}
                    onChange={() => handleSelectStudent(student.studentId)}
                    style={{ margin: '0' }}
                  />
                </td>
                <td>{(currentPage - 1) * limit + index + 1}</td>
                <td className="special-yellow">{student.name}</td>
                <td className="special-blue">{student.email}</td>
                <td>{student.mobile}</td>
                <td>
                  <span className='delSpan'>
                    <FaTrash
                      className="icon-delete"
                      onClick={() => handleDelete(student.studentId)}
                      style={{ cursor: 'pointer' }}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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

      {/* Enroll Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-90w">
        <Modal.Header closeButton>
          <Modal.Title>Enroll Students</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Select Course</h5>
          <Dropdown onSelect={(eventKey) => setSelectedCourse(eventKey)}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {selectedCourse || 'Select a course'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {courses.map(course => (
                <Dropdown.Item key={course.courseId} eventKey={course.courseId}>
                  {course.courseName}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleEnroll} disabled={!selectedCourse}>
            Enroll
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EnrollStudentDetails;

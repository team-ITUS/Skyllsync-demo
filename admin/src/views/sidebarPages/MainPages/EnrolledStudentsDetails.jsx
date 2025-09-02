import React, { useState, useEffect } from 'react';
import { Table, Form, Row, Col, Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md'
import axios from 'axios';
import '../../SidebarCss/Table.css';
import { BASE_URL } from '../../../BaseURL';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

import { useNavigate } from 'react-router-dom';
import Pagination from '../../../components/custom/Pagination';

const EnrolledStudentDetails = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 50;

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);


  const fetchStudents = async () => {
    const getAll = true;
    try {
      const response = await axios.get(`${BASE_URL}/enroll/getAllStudWithCors`, {
        params: { page: currentPage, limit, getAll }
      });
      const respData = response?.data;

      if (respData?.success) {
        const { studentDetails, totalPages } = respData;
        setStudents(studentDetails);
        setTotalPages(totalPages);
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        await axios.delete(`${BASE_URL}/admin/deleteStudentById/${studentId}`);
        fetchStudents();
        toast.success("Student deleted successfully", { position: 'top-center' });
      } catch (error) {

        toast.error("Error deleting student", { position: 'top-center' });
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className='mainTableContainer'>
      <h4 style={{ textAlign: "center", color: "black", marginBottom: "3%", fontSize: "28px" }}>Enrolled Student Details</h4>

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
        <Col xs={2} style={{ textAlign: 'right' }}>
          <Button
            variant="dark"
            size="sm"
            onClick={() => navigate('/enroll-student')}
          >
            Add Student
          </Button>
        </Col>
      </Row>

      <div className="table-container mt-4 rounded-table-wrapper">
        <table className="table table-bordered table-hover align-middle text-center custom-table accessor-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th className="special-yellow">Full Name</th>
              <th className="special-blue">Email</th>
              <th>Mobile Number</th>
              <th>Enrolled Course</th>
              <th>Enrollment Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={student.studentId}>
                <td>{(currentPage - 1) * limit + index + 1}</td>
                <td className="special-yellow">{student.name}</td>
                <td className="special-blue" title={student.email}>{student.email}</td>
                <td>{student.mobile}</td>
                <td>{student.enrolledCourse}</td>
                <td>{formatDate(student.enrolledDate)}</td>
                <td>
                  <span className='delSpan'>
                    <FaTrash className="icon-delete" onClick={() => handleDelete(student.studentId)} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Toast Container for notifications */}
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  );
};

export default EnrolledStudentDetails;

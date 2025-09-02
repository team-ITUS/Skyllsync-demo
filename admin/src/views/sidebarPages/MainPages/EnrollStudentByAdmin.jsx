import React, { useState } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { BASE_URL } from '../../../BaseURL'; // Import the BASE_URL
import '../../SidebarCss/Form.css'; // Add this for additional styling
import axios from 'axios'; // Add Axios for making API requests
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { useNavigate } from 'react-router-dom';
import { normalizeEmail } from '../../../utils/dataHelpers';

const EnrollStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: '',
    studentNickName: '',
    studentEmail: '',
    studentMobNo: '',
    studentDob: '',
    studentGender: '',
    enrolledCourse: '',
    enrolledCourseId: '',
    enrolledDate: '',
    enrolledBy: '', // Default to 'student', change as needed
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate mobile number length
    if (formData.studentMobNo.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits.', { position: 'top-center' });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/admin/enrolledStudent`, formData);
      const responseData = response.data;

      // Check if success is true in the response
      if (responseData.success) {
        toast.success('Student enrolled successfully!', { position: 'top-center' });

        // Clear the form after successful submission
        setFormData({
          studentName: '',
          studentNickName: '',
          studentEmail: '',
          studentMobNo: '',
          studentDob: '',
          studentGender: '',
          enrolledCourse: '',
          enrolledCourseId: '',
          enrolledDate: '',
          enrolledBy: '',
        });
        navigate('/enrolled-students')
      } else {
        toast.error('Error enrolling student. Please check your details and try again.', { position: 'top-center' });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message||'Internal server error. Tyr after some time.',  { position: 'top-center' });
    }
  };

  return (
    <Container className="mt-4">
      <Toaster
  position="top-center"
  reverseOrder={true}
/>
      <div className="form-container shadow p-4 rounded">
        <h4 className="text-center mb-2" style={{fontSize: "28px"}}>Enroll Student</h4>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="studentName">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Full Name"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="studentNickName">
                <Form.Label>Nick Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Nick Name"
                  name="studentNickName"
                  value={formData.studentNickName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="studentEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Email Here"
                  name="studentEmail"
                  value={normalizeEmail(formData.studentEmail)}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="studentMobNo">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Mobile Number"
                  name="studentMobNo"
                  value={formData.studentMobNo}
                  onChange={handleChange}
                  required
                  maxLength={10} // Limit input to 10 characters
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="studentDob">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="studentDob"
                  value={formData.studentDob}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="studentGender">
                <Form.Label>Gender</Form.Label>
                <Form.Control
                  as="select"
                  name="studentGender"
                  value={formData.studentGender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="enrolledCourse">
                <Form.Label>Enrolled Course</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Enrolled Course"
                  name="enrolledCourse"
                  value={formData.enrolledCourse}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="enrolledCourseId">
                <Form.Label>Course ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Course ID"
                  name="enrolledCourseId"
                  value={formData.enrolledCourseId}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="enrolledDate">
                <Form.Label>Enrollment Date</Form.Label>
                <Form.Control
                  type="date"
                  name="enrolledDate"
                  value={formData.enrolledDate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="enrolledBy">
                <Form.Label>Enrolled By</Form.Label>
                <Form.Control
                  as="select"
                  name="enrolledBy"
                  value={formData.enrolledBy}
                  onChange={handleChange}
                  required
                >
                  <option value="admin">Admin</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center mt-3">
            <Button type="submit" variant='dark' style={{  color: "white", fontSize: "14px" }} size="sm">
              Enroll
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default EnrollStudent;

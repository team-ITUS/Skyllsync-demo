import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { BASE_URL } from '../../../BaseURL';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
// import { useRecaptchaToken } from '../../../components/custom/RecaptchaV3';

import { InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../SidebarCss/AdminLogin.css'

const AdminLoginForm = () => {
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate
  // const getRecaptchaToken = useRecaptchaToken('admin_login');

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const recaptchaToken = await getRecaptchaToken();
    // if (!recaptchaToken) {
    //   toast.error('reCAPTCHA verification failed. Please try again.');
    //   return;
    // }

    try {
      const response = await axios.post(`${BASE_URL}/admin/commonLogIn`, {
        userName: adminName,
        password: adminPassword,
        loginRole: 'admin', // <-- Add this line to specify loginRole
        // recaptchaToken,
      });

      const respData = response.data;

      if (respData?.success) {
        localStorage.setItem('menuDtl', JSON.stringify(respData?.menuDtl));
        localStorage.setItem('roleId', respData?.roleId);
        localStorage.setItem('role', respData?.role);
        localStorage.setItem('uuid', respData?.uuid);

        // Store profileName as userName in local storage
        localStorage.setItem('userName', respData.profileName);

        toast.success(respData?.message);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error(respData.message || "Failed to login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after some time.');
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center bg-image"
      style={{ height: '100vh', backgroundColor: '#f8f9fa' }}
    >
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <div className="text-center mb-4">
            <h2 className="font-weight-bold">Login User</h2>
          </div>
          <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-sm">
            <Form.Group controlId="adminName" className="mb-3">
              <Form.Label className="font-weight-semibold">User Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username or email"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value.trim())}
                required
              />
            </Form.Group>

            {/* <Form.Group controlId="adminPassword" className="mb-3">
              <Form.Label className="font-weight-semibold">User Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value.trim())}
                required
              />
            </Form.Group> */}

            <Form.Group controlId="adminPassword" className="mb-3">
              <Form.Label className="font-weight-semibold">User Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value.trim())}
                  required
                />
                <InputGroup.Text onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <div className="d-flex justify-content-center w-100 mt-4">
              <Button
                variant='primary'
                type="submit"
                className="w-50"
              >
                Login
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      <Toaster
  position="top-center"
  reverseOrder={true}
/>
</Container>
  );
};

export default AdminLoginForm;

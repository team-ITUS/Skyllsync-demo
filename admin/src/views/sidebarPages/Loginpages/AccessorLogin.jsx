import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'; // Import axios
import { BASE_URL } from '../../../BaseURL';

const AccessorLogin = () => {
  const [accessorEmail, setAccessorEmail] = useState('');
  const [accessorName, setAccessorName] = useState(''); // New state for accessorName
  const [accessorPassword, setAccessorPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Sending a POST request to login
      const response = await axios.post(`${BASE_URL}/accessor/loginAccessor`, {
        accessorEmail,
        accessorPassword,
        accessorName, // Pass accessorName to the backend (though it's optional in login)
      });

      if (response.data.success) {
        // Show success toast message
        toast.success(response?.data?.message, { position: 'top-center' });
        // Redirect after a brief delay
        setTimeout(() => {
          window.location.href = '/dashboard'; // Redirect to dashboard
        }, 1000);
      } else {
        // Show error toast message if login fails
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error?.response?.data?.message||'Internal server error. Tyr after some time.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ height: '100vh', backgroundColor: '#f8f9fa' }}
    >
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <div className="text-center mb-4">
            <h2 className="font-weight-bold">Examiner Login</h2>
          </div>
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}
          {success && <Alert variant="success" className="text-center">{success}</Alert>}
          <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-sm">
            <Form.Group controlId="accessorName" className="mb-3">
              <Form.Label className="font-weight-semibold">Examiner Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter accessor name"
                value={accessorName}
                onChange={(e) => setAccessorName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="accessorEmail" className="mb-3">
              <Form.Label className="font-weight-semibold">Accessor Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter accessor email"
                value={accessorEmail}
                onChange={(e) => setAccessorEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="accessorPassword" className="mb-3">
              <Form.Label className="font-weight-semibold">Examiner Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={accessorPassword}
                onChange={(e) => setAccessorPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-center w-100 mt-4">
              <Button variant="primary" type="submit" className="w-50">
                Login
              </Button>
            </div>
          </Form>
          <Toaster
  position="top-center"
  reverseOrder={true}
/>
        </Col>
      </Row>
    </Container>
  );
};

export default AccessorLogin;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../BaseURL';
import { Form, Row, Col, Spinner, Button, Container, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../SidebarCss/Form.css';
import '../../SidebarCss/Table.css';

const AdminProfile = () => {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState(null);
    const [signatureImage, setSignatureImage] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState(null);

    // Fetch admin details from the server
    const fetchAdminDetails = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/getAdminDtl`);
            const respData = response.data;

            if (respData?.success) {
                setAdminData(respData?.adminDtl || {});
            } else {
                toast.error(respData?.message || 'Admin details not available');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Internal server error. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch admin data when component mounts
    useEffect(() => {
        fetchAdminDetails();
    }, []);

    // Handle file input changes for profile and signature images
    const handleFileChange = (event, type) => {
        const file = event.target.files[0];
        if (type === 'profile') {
            setProfileImage(file);
        } else if (type === 'signature') {
            setSignatureImage(file);
        }
    };

    // Toggle between edit mode and view mode
    const handleEdit = () => {
        setIsEdit(!isEdit);
    };

    // Handle the update of admin details
    const handleUpdate = async () => {
        try {
            const frmData = new FormData();
            if (adminData.userName) {
                frmData.append('userName', adminData.userName);
            }
            if (adminData.adminPassword) {
                frmData.append('adminPassword', adminData.adminPassword);
            }
            if (profileImage) {
                frmData.append('profile', profileImage);
            }
            if (signatureImage) {
                frmData.append('signature', signatureImage);
            }

            const response = await axios.put(`${BASE_URL}/admin/updateAdminDtl`, frmData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const respData = response.data;
            if (respData?.success) {
                toast.success(respData?.message || 'Admin details updated successfully');
                fetchAdminDetails(); // Refresh data after update
            } else {
                toast.error(respData?.message || 'Failed to update admin details');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Internal server error. Try again later.');
        } finally {
            setIsEdit(false);
        }
    };


    const handleImageClick = (imageUrl) => {
        setModalImage(imageUrl);
        setShowModal(true);
    };


    if (loading) {
        return <Spinner animation="border" variant="primary" />;
    }

    return (
        <Container className="mt-4">
            <div className="form-container shadow p-4 rounded" style={{ maxWidth: '600px' }}>
                <h4 className="text-center mb-2">Admin Profile</h4>
                <Form>
                    <Row className="mb-3">
                        <Form.Group as={Col} md={6} controlId="adminName">
                            <Form.Label>User Name:</Form.Label>
                            <Form.Control
                                type="text"
                                value={adminData?.userName || ''}
                                onChange={(e) => setAdminData({ ...adminData, userName: e.target.value.trim() })}
                                readOnly={!isEdit}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="adminPassword">
                            <Form.Label>User Password:</Form.Label>
                            <Form.Control
                                type="text"
                                value={adminData?.adminPassword || ''}
                                onChange={(e) => setAdminData({ ...adminData, adminPassword: e.target.value.trim() })}
                                readOnly={!isEdit}
                            />
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} md={6} controlId="adminProfile">
                            <Form.Label>Admin Profile:</Form.Label>
                            {!isEdit ? (
                                <img
                                    src={`${BASE_URL}/${adminData.profile}`}
                                    alt="Admin Profile"
                                    style={{ width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer' }}
                                    onClick={() => handleImageClick(`${BASE_URL}/${adminData.profile}`)}
                                />
                            ) : (
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'profile')}
                                    style={{ marginTop: '10px' }}
                                />
                            )}
                        </Form.Group>

                        <Form.Group as={Col} md={6} controlId="adminSignature">
                            <Form.Label>Admin Signature:</Form.Label>
                            {!isEdit ? (
                                <img
                                    src={`${BASE_URL}/${adminData.signature}`}
                                    alt="Admin Signature"
                                    style={{ width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer' }}
                                    onClick={() => handleImageClick(`${BASE_URL}/${adminData.signature}`)}
                                />
                            ) : (
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'signature')}
                                    style={{ marginTop: '10px' }}
                                />
                            )}
                        </Form.Group>
                    </Row>

                    <div className="d-flex justify-content-end">
                        <Button
                            className="comAddBtn mt-2"
                            size="sm"
                            onClick={() => {
                                isEdit ? handleUpdate() : handleEdit();
                            }}
                        >
                            {isEdit ? 'Save Changes' : 'Edit'}
                        </Button>
                    </div>
                </Form>
            </div>

          
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Image Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <img src={modalImage} alt="Preview" style={{ width: '100%', height: 'auto' }} />
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdminProfile;


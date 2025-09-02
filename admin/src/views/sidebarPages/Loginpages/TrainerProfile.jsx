import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../BaseURL';
import { Form, Row, Col, Spinner, Button, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../SidebarCss/Form.css';
import '../../SidebarCss/Table.css';
import { normalizeEmail } from '../../../utils/dataHelpers';

const TrainerProfile = () => {
    
    const [trainerData, setTrainerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    const fetchTrainerDetails = async () => {
        const trainerId = localStorage.getItem('uuid');
        try {
            const response = await axios.get(`${BASE_URL}/trainer/getTrainerById/${trainerId}`);
            const respData = response.data;

            if (respData?.success) {
                setTrainerData(respData?.trainer || {});
            } else {
                toast.error(respData?.message || 'Failed to fetch trainer details.');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to fetch trainer details.');
        } finally {
            setLoading(false);
        }
    };

    //formate date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setProfileImage(file);
    };

    //toggle edit or save change
    const handleEdit = () => {
        setIsEdit(!isEdit);
    }

    const handleUpdate = async () => {
        const trainerId = localStorage.getItem('uuid');
        try {
            const frmData = new FormData();
            frmData.append('trainerEmail', normalizeEmail(trainerData?.trainerEmail));
            frmData.append('trainerMobNo', trainerData?.trainerMobNo);
            frmData.append('trainerName', trainerData?.trainerName);
            frmData.append('trainerDob', trainerData?.trainerDob);
            frmData.append('trainerGender', trainerData?.trainerGender);
            frmData.append('trainerJoinDate', trainerData?.trainerJoinDate);
            frmData.append('trainerEdu', trainerData?.trainerEdu);
            frmData.append('trainerAddr', trainerData?.trainerAddr);


            if (profileImage) {
                frmData.append('file', profileImage);
            }

            const response = await axios.put(`${BASE_URL}/trainer/updateTrainerById/${trainerId}`, frmData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            const respData = response.data;

            if(respData?.success){
                toast.success(respData?.message || "Detail updated successfully");
                fetchTrainerDetails();
                setIsEdit(!isEdit);
            }else{
                toast.error(respData?.message || "Fail to update details");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to fetch trainer details.');
        }
    }

    useEffect(() => {
        fetchTrainerDetails();
    }, []);

    if (loading) {
        return <Spinner animation="border" variant="primary" />;
    }

    return (
        <Container className="mt-4">
            <div className="form-container shadow p-4 rounded" style={{ maxWidth: '700px' }}>
                <h4 className="text-center mb-2">Trainer Profile</h4>
                <Form>
                    <Row className="mb-2">
                        <Form.Group as={Col} md={6} controlId="trainerName">
                            <Form.Label>Trainer Name:</Form.Label>
                            <Form.Control
                                type="text"
                                value={trainerData?.trainerName || ''}
                                onChange={(e) => setTrainerData({ ...trainerData, trainerName: e.target.value })}
                                readOnly={!isEdit}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="trainerEmail">
                            <Form.Label>Email:</Form.Label>
                            <Form.Control
                                type="email"
                                value={normalizeEmail(trainerData?.trainerEmail) || ''}
                                onChange={(e) => setTrainerData({ ...trainerData, trainerEmail: e.target.value })}
                                readOnly={!isEdit}
                            />
                        </Form.Group>
                    </Row>

                    <Row className="mb-2">
                        <Form.Group as={Col} md={6} controlId="trainerMobNo">
                            <Form.Label>Mobile No:</Form.Label>
                            <Form.Control
                                type="text"
                                value={trainerData?.trainerMobNo || ''}
                                onChange={(e) => setTrainerData({ ...trainerData, trainerMobNo: e.target.value })}
                                readOnly={!isEdit}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="trainerDob">
                            <Form.Label>Date of Birth:</Form.Label>
                            <Form.Control
                                type="date"
                                value={formatDate(trainerData?.trainerDob) || ''}
                                onChange={(e) => setTrainerData({ ...trainerData, trainerDob: e.target.value })}
                                readOnly={!isEdit}
                            />
                        </Form.Group>
                    </Row>

                    <Row className="mb-2">
                        <Form.Group as={Col} md={6} controlId="trainerGender">
                            <Form.Label>Gender</Form.Label>
                            <Form.Control
                                as="select"
                                name="trainerGender"
                                value={trainerData?.trainerGender || ''}
                                onChange={(e) => setTrainerData({ ...trainerData, trainerGender: e.target.value })}
                                disabled={!isEdit}
                            >
                                <option value="" disabled>
                                    {trainerData?.trainerGender}
                                </option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="trainerJoinDate">
                            <Form.Label>Join Date:</Form.Label>
                            <Form.Control
                                type="date"
                                value={formatDate(trainerData?.trainerJoinDate) || ''}
                                onChange={(e) => setTrainerData({ ...trainerData, trainerJoinDate: e.target.value })}
                                readOnly={true}
                            />
                        </Form.Group>
                    </Row>

                    <Row className="mb-2">
                        <Form.Group as={Col} md={6} controlId="trainerEdu">
                            <Form.Label>Education:</Form.Label>
                            <Form.Control
                                type="text"
                                value={trainerData?.trainerEdu || ''}
                                onChange={(e) => setTrainerData({ ...trainerData, trainerEdu: e.target.value })}
                                readOnly={!isEdit}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="trainerAddr">
                            <Form.Label>Address:</Form.Label>
                            <Form.Control
                                type="text"
                                value={trainerData?.trainerAddr || ''}
                                onChange={(e) => setTrainerData({ ...trainerData, trainerAddr: e.target.value })}
                                readOnly={!isEdit}
                            />
                        </Form.Group>
                    </Row>

                    <Row className="mb-2">
                        <Form.Group as={Col} md={6} controlId="trainerProfile">
                            <Form.Label>Profile Image:</Form.Label>
                            {!isEdit ? (
                                <img
                                    src={`${BASE_URL}/${trainerData.trainerProfile}`}
                                    alt="Trainer Profile"
                                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                />
                            ) :
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ marginTop: '10px' }}
                                />}
                        </Form.Group>
                    </Row>

                    <div className="d-flex justify-content-end">
                        <Button className='comAddBtn' size="sm"
                            onClick={() => {
                                isEdit ? handleUpdate() : handleEdit();
                            }}
                        >
                            {isEdit ? "Save Changes" : "Edit"}
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default TrainerProfile;

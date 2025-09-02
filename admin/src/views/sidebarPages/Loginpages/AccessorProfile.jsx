import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { BASE_URL } from '../../../BaseURL'
import { Form, Row, Col, Spinner, Button, Container, Modal } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../SidebarCss/Form.css'
import '../../SidebarCss/Table.css'
import { normalizeEmail } from '../../../utils/dataHelpers'

const AccessorProfile = () => {
  const [accessorData, setAccessorData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileImage, setProfileImage] = useState(null)
  const [signatureImage, setSignatureImage] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const fetchAccessorDetails = async () => {
    const accessorId = localStorage.getItem('uuid')
    try {
      const response = await axios.get(`${BASE_URL}/accessor/getAccessorById/${accessorId}`)
      const respData = response.data

      if (respData?.success) {
        setAccessorData(respData?.accessor || {})
      } else {
        toast.error(respData?.message || 'Examiner not found')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch accessor details.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event, type) => {
    const file = event.target.files[0]
    if (type === 'accessorProfile') {
      setProfileImage(file)
    } else if (type === 'signature') {
      setSignatureImage(file)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleEdit = () => {
    setIsEdit(!isEdit)
  }

  // Update data
  const handleUpdate = async () => {
    const accessorId = localStorage.getItem('uuid')
    try {
      const frmData = new FormData()
      frmData.append('accessorName', accessorData?.accessorName)
      frmData.append('accessorEmail', accessorData?.accessorEmail)
      frmData.append('accessorMobNo', accessorData?.accessorMobNo)
      frmData.append('accessorDob', accessorData?.accessorDob)
      frmData.append('accessorGender', accessorData?.accessorGender)
      frmData.append('accessorJoinDate', accessorData?.accessorJoinDate)
      frmData.append('accessorAddr', accessorData?.accessorAddr)
      frmData.append('accessorPassword',accessorData?.accessorPassword)

      if (profileImage) {
        frmData.append('imagePath', profileImage)
      }

      if (signatureImage) {
        frmData.append('signature', signatureImage)
      }

      const response = await axios.put(
        `${BASE_URL}/accessor/updateAccessorById/${accessorId}`,
        frmData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      const respData = response.data

      if (respData?.success) {
        toast.success(respData?.message || 'Examiner details updated successfully')
      } else {
        toast.error(respData?.message || 'Examiner not exist for update details')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after some time.')
    } finally {
      setIsEdit(!isEdit)
    }
  }

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedImage(null)
  }

  useEffect(() => {
    fetchAccessorDetails()
  }, [])

  if (loading) {
    return <Spinner animation="border" variant="primary" />
  }

  return (
    <Container className="mt-4">
      <div className="form-container shadow p-4 rounded" style={{ maxWidth: '700px' }}>
        <h4 className="text-center mb-2">Examiner Profile</h4>
        <Form>
          <Row className="mb-2">
            <Form.Group as={Col} md={6} controlId="accessorName">
              <Form.Label>Examiner Name:</Form.Label>
              <Form.Control
                type="text"
                value={accessorData?.accessorName || ''}
                onChange={(e) => setAccessorData({ ...accessorData, accessorName: e.target.value })}
                readOnly={!isEdit}
              />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="accessorEmail">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                value={normalizeEmail(accessorData?.accessorEmail) || ''}
                onChange={(e) =>
                  setAccessorData({ ...accessorData, accessorEmail: e.target.value })
                }
                readOnly={!isEdit}
              />
            </Form.Group>
          </Row>

          <Row className="mb-2">
            <Form.Group as={Col} md={6} controlId="accessorMobNo">
              <Form.Label>Mobile No:</Form.Label>
              <Form.Control
                type="text"
                value={accessorData?.accessorMobNo || ''}
                onChange={(e) =>
                  setAccessorData({ ...accessorData, accessorMobNo: e.target.value })
                }
                readOnly={!isEdit}
              />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="accessorDob">
              <Form.Label>Date of Birth:</Form.Label>
              <Form.Control
                type="date"
                value={formatDate(accessorData?.accessorDob) || ''}
                onChange={(e) => setAccessorData({ ...accessorData, accessorDob: e.target.value })}
                readOnly={!isEdit}
              />
            </Form.Group>
          </Row>

          <Row className="mb-2">
            <Form.Group as={Col} md={6} controlId="accessorGender">
              <Form.Label>Gender:</Form.Label>
              <Form.Control
                type="text"
                value={accessorData?.accessorGender || ''}
                onChange={(e) =>
                  setAccessorData({ ...accessorData, accessorGender: e.target.value })
                }
                readOnly={!isEdit}
              />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="accessorJoinDate">
              <Form.Label>Join Date:</Form.Label>
              <Form.Control
                type="date"
                value={formatDate(accessorData?.accessorJoinDate) || ''}
                onChange={(e) =>
                  setAccessorData({ ...accessorData, accessorJoinDate: e.target.value })
                }
                readOnly={true}
              />
            </Form.Group>
          </Row>

          <Row className="mb-2">
            <Form.Group as={Col} md={6} controlId="accessorPassword">
              <Form.Label>Password:</Form.Label>
              <Form.Control
                type="text"
                value={accessorData?.accessorPassword || ''}
                onChange={(e) =>
                  setAccessorData({ ...accessorData, accessorPassword: e.target.value.trim() })
                }
                readOnly={!isEdit}
              />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="accessorAddr">
              <Form.Label>Address:</Form.Label>
              <Form.Control
                type="text"
                value={accessorData?.accessorAddr || ''}
                onChange={(e) => setAccessorData({ ...accessorData, accessorAddr: e.target.value })}
                readOnly={!isEdit}
              />
            </Form.Group>
          </Row>

          <Row className="mb-2">
            <Form.Group as={Col} md={6} controlId="accessorProfile">
              <Form.Label>Profile Image:</Form.Label>
              {!isEdit ? (
                <img
                  src={`${BASE_URL}/${accessorData.accessorProfile}`}
                  alt="Examiner Profile"
                  style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                  onClick={() => handleImageClick(`${BASE_URL}/${accessorData.accessorProfile}`)}
                />
              ) : (
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'accessorProfile')}
                  style={{ marginTop: '10px' }}
                />
              )}
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="accessorSignature">
              <Form.Label>Signature:</Form.Label>
              {!isEdit ? (
                <img
                  src={`${BASE_URL}/${accessorData.signature}`}
                  alt="Examiner Signature"
                  style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                  onClick={() => handleImageClick(`${BASE_URL}/${accessorData.signature}`)}
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
              className="comAddBtn"
              size="sm"
              onClick={() => {
                isEdit ? handleUpdate() : handleEdit()
              }}
            >
              {isEdit ? 'Save Changes' : 'Edit'}
            </Button>
          </div>
        </Form>
      </div>

      {/* Modal to display full image */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <img src={selectedImage} alt="Selected" style={{ width: '100%', height: 'auto' }} />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default AccessorProfile

//removed completed batch 

//admin
//examiner
//trainer
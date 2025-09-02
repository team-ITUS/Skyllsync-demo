import React, { useState, useEffect } from 'react'
import { Table, Form, Row, Col, Button, Modal } from 'react-bootstrap'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import axios from 'axios'
import '../../SidebarCss/Table.css'
import { BASE_URL } from '../../../BaseURL'
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

import { useNavigate } from 'react-router-dom'
import InputField from '../../../components/custom/InputField'
import CustomButton from '../../../components/custom/CustomButton'
import ActionMenu from '../../../components/custom/ActionMenu'
import Pagination from '../../../components/custom/Pagination'

const TrainerDetails = () => {
  const [trainers, setTrainers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 50
  const navigate = useNavigate()

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  const fetchTrainers = async (currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/trainer/getTrainerList`, {
        params: { page: currentPage, limit, searchTerm },
      })
      const respData = response.data
      if (respData?.success) {
        const { trainers, totalPages } = response.data
        setTrainers(trainers)
        setTotalPages(totalPages)
      }
    } catch (error) {
      setTrainers([])
      setTotalPages(1)
    }
  }

  // Fetch Trainers from the backend
  useEffect(() => {
    fetchTrainers(currentPage)
  }, [currentPage, searchTerm])

  const handleEdit = (trainer) => {
    navigate('/update-trainer', { state: { trainerId: trainer.trainerId } })
  }

  const handleDelete = async (trainerId) => {
    const result = await MySwal.fire({
      title: 'Delete Trainer Details?',
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
        await axios.delete(`${BASE_URL}/trainer/deleteTrainerById/${trainerId}`)
        fetchTrainers(currentPage)
        toast.success('Trainer deleted successfully', { position: 'top-center' })
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
      }
    }

  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  // Utility function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', options)
  }

  // Handle image click to show modal
  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc)
    setShowModal(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedImage('')
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
  };

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
  };

  //icon stylling end 

  return (
    <div className="mainTableContainer">
      <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>All Trainer</h4>

      <div className='row' style={{ marginBottom: '15px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className='col-lg-6' style={{ textAlign: 'left' }}>
          <div style={{ width: "50%" }}>
            <InputField
              type="text"
              label='Search By'
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
            />
          </div>
        </div>
        <div className='col-lg-6 mt-4 d-flex justify-content-end' style={{ textAlign: 'right' }}>
          <CustomButton
            title="Add Trainer"
            onClick={() => navigate('/add-trainer')}
            icon="tabler_plus.svg"
          />
        </div>
      </div>


      <div className="table-container mt-4">
        <table className="table table-bordered table-hover align-middle text-center custom-table accessor-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Profile</th>
              <th className="special-yellow">Name</th>
              <th className="special-blue">Email</th>
              <th>Mobile</th>
              <th>Joining Date</th>
              <th>Action</th>
            </tr>
          </thead>
          {trainers?.length === 0 ? (
            <div>No trainer available</div>
          ) : (
            <tbody>
              {trainers?.map((trainer, index) => (
                <tr key={index}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td>
                    <img
                      src={
                        trainer.trainerProfile
                          ? `${BASE_URL}/${trainer.trainerProfile}`
                          : '/placeholder.jpg'
                      }
                      alt="Profile"
                      className="common-image"
                      onClick={() =>
                        handleImageClick(
                          trainer.trainerProfile
                            ? `${BASE_URL}/${trainer.trainerProfile}`
                            : '/placeholder.jpg',
                        )
                      }
                    />
                  </td>
                  <td className="special-yellow">{trainer.trainerName}</td>
                  <td className="special-blue" title={trainer.trainerEmail}>
                    {trainer.trainerEmail} {/* Display full email without truncation */}
                  </td>
                  <td>{trainer.trainerMobNo}</td>
                  <td>{formatDate(trainer.trainerJoinDate)}</td>
                  <td>
                    <ActionMenu
                      options={[
                        {
                          icon: 'material-symbols_edit-outline.svg',
                          title: 'Edit Trainer Details',
                          onClick: () => handleEdit(trainer),
                        },
                        {
                          icon: 'material-symbols_delete-outline.svg',
                          title: 'Delete Trainer',
                          onClick: () => handleDelete(trainer.trainerId),
                        },
                      ]}
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

      {/* Modal for Profile Image */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Profile Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img
            src={selectedImage}
            alt="Profile"
            style={{ width: '100%', height: 'auto' }} // Responsive image
          />
        </Modal.Body>
      </Modal>

      {/* Toast Container for notifications */}
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  )
}

export default TrainerDetails

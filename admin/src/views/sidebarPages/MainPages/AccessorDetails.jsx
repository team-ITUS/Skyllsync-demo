import React, { useState, useEffect } from 'react'
import { Table, Form, Row, Col, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaPencilAlt, FaTrash, FaSignInAlt } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL } from '../../../BaseURL'
import toast, { Toaster } from 'react-hot-toast';

import { MdCancel } from 'react-icons/md'
import '../../SidebarCss/Table.css'
import CustomButton from '../../../components/custom/CustomButton'
import InputField from '../../../components/custom/InputField'
import ActionMenu from '../../../components/custom/ActionMenu'
import Pagination from '../../../components/custom/Pagination'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

const AccessorDetails = () => {
  const [accessors, setAccessors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 50 // Set the number of items per page
  const navigate = useNavigate() // Initialize useNavigate
  const [role, setRole] = useState(localStorage.getItem('role'))

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  const fetchAccessors = async (currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/accessor/getAccessorList`, {
        params: { page: currentPage, limit, searchTerm },
      })
      const respData = response.data
      if (respData?.success) {
        const { accessors, totalPages } = response.data // Destructure response
        setAccessors(accessors)
        setTotalPages(totalPages)
      }
    } catch (error) {
      setAccessors([])
      setTotalPages(1)
    }
  }

  // Fetch Accessors from the backend
  useEffect(() => {
    fetchAccessors(currentPage)
  }, [currentPage, searchTerm])

  // Function to handle edit action and fetch accessor details
  const handleEdit = (accessor) => {
    navigate('/update-accessor', { state: { accessorId: accessor.accessorId } }) // Navigate to the Update Accessor page with the accessorId
  }

  const handleDelete = async (accessorId) => {
    const result = await MySwal.fire({
      title: 'Delete Examiner Details?',
      text: 'This action cannot be undone.',
      icon: 'warning',
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
        await axios.delete(`${BASE_URL}/accessor/deleteAccessorById/${accessorId}`)
        fetchAccessors(currentPage) // Refresh accessors after deletion
        toast.success('Accessor deleted successfully') // Show success toast
      } catch (error) {

        toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
      }
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleAddAccessor = () => {
    navigate('/add-accessor') // Navigate to Add Accessor page
  }

  // Utility function to format date from yyyy-mm-dd to dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-indexed
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
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
      <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>All Examiner</h4>

      {/* Search Bar and Add Accessor Button Row */}
      <div className='row' style={{ marginBottom: '15px', alignItems: 'center' }}>
        <div className='col-lg-6' style={{ textAlign: 'left' }}>
          <div style={{ width: "50%" }}>
            <InputField
              label='Search By'
              type="text"
              placeholder="Search Name, Email, Mobile"
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
            />
          </div>
        </div>

        <div className='col-lg-6 mt-4 d-flex justify-content-end' style={{ textAlign: 'right' }}>
          <CustomButton title="Add Examiner" icon="tabler_plus.svg" onClick={handleAddAccessor} />
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
              {role === 'admin' && <th>Action</th>}
            </tr>
          </thead>
          {accessors?.length === 0 ? (
            <div>No accessor available</div>
          ) : (
            <tbody>
              {accessors?.map((accessor, index) => (
                <tr key={index}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td>
                    <img
                      src={
                        accessor.accessorProfile
                          ? `${BASE_URL}/${accessor.accessorProfile}`
                          : '/placeholder.jpg'
                      }
                      alt="Profile"
                      className="common-image"
                      onClick={() =>
                        handleImageClick(
                          accessor.accessorProfile
                            ? `${BASE_URL}/${accessor.accessorProfile}`
                            : '/placeholder.jpg',
                        )
                      } // Show placeholder if no image
                    />
                  </td>
                  <td className="special-yellow">{accessor.accessorName}</td>
                  <td className="special-blue" title={accessor.accessorEmail}>
                    {accessor.accessorEmail} {/* Display full email without truncation */}
                  </td>
                  <td>{accessor.accessorMobNo}</td>
                  <td>{formatDate(accessor.accessorJoinDate)}</td> {/* Format the joining date */}
                  {role === 'admin' && (
                    <td>
                      <ActionMenu
                        options={[
                          {
                            icon: 'material-symbols_edit-outline.svg',
                            title: 'Edit Examiner Details',
                            onClick: () => handleEdit(accessor),
                          },
                          {
                            icon: 'material-symbols_delete-outline.svg',
                            title: 'Delete Examiner',
                            onClick: () => handleDelete(accessor.accessorId),
                          },
                        ]}
                      />

                      {/*<span className='loginSpan'>
                      <FaSignInAlt className="icon-login" onClick={() => handleLogin(accessor?.accessorEmail)} />
                    </span>*/}
                    </td>
                  )}
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

export default AccessorDetails

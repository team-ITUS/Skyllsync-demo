import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap'
import axios from 'axios'
import { BASE_URL } from '../../../BaseURL'
import { FaTrash, FaPencilAlt } from 'react-icons/fa'
import '../../SidebarCss/Table.css'
import { MdCancel } from 'react-icons/md'
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css'
import InputField from '../../../components/custom/InputField'
import CustomButton from '../../../components/custom/CustomButton'
import ActionMenu from '../../../components/custom/ActionMenu'
import Pagination from '../../../components/custom/Pagination'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';
import { normalizeEmail } from '../../../utils/dataHelpers'

const MySwal = withReactContent(Swal)

const AllBranches = () => {
  const [show, setShow] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState('')
  const [isEdit, setIsEdit] = useState(false)

  const [branchName, setBranchName] = useState('')
  const [branchAddress, setBranchAddress] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [email, setEmail] = useState('')
  const [logoes, setLogoes] = useState({
    logoOne: null,
    logoTwo: null,
    logoThree: null,
    logoFour: null,
  })

  const [prefixOne, setPrefixOne] = useState('')
  const [prefixTwo, setPrefixTwo] = useState('')
  const [includeYear, setIncludeYear] = useState(false)
  const [includeMonth, setIncludeMonth] = useState(false)
  const [startIndex, setStartIndex] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [emailError, setEmailError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 50

  //hangle change for logoes
  const handleImageChange = (e) => {
    const { name, files } = e.target
    setLogoes((prevLogoes) => ({
      ...prevLogoes,
      [name]: files[0] || null,
    }))
  }

  const fetchBranches = async (currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/branch/getBranchList`, {
        params: {
          page: currentPage,
          limit,
          search: searchTerm,
        },
      })
      const respData = response.data

      if (respData?.success) {
        setBranches(respData?.branchesList)
        setTotalPages(respData?.totalPages)
      } else {
        toast.error(respData.message || 'Failed to fetch branches', {
          position: 'top-center',
        })
      }
    } catch (error) {
      setBranches([])
      setTotalPages(1)
    }
  }

  const handleShow = () => setShow(true)
  const handleClose = () => {
    setShow(false)
    clearForm()
  }

  //open update form when click on edit
  const handleShowUpdate = (branch) => {
    setBranchId(branch?.branchId)
    setBranchName(branch?.branchName)
    setBranchAddress(branch?.branchAddress)
    setContactPerson(branch?.contactPerson)
    setContactNo(branch?.contactNo)
    setEmail(branch?.email)
    setPrefixOne(branch?.prefixOne)
    setPrefixTwo(branch?.prefixTwo)
    setIncludeMonth(branch?.includeMonth)
    setIncludeYear(branch?.includeYear)
    setStartIndex(branch?.startIndex)

    if (!includeMonth) {
      setMonth(new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase()) // Example: "Feb"
    } else {
      setMonth('')
    }

    if (!includeYear) {
      setYear(new Date().getFullYear())
    } else {
      setYear('')
    }

    setLogoes({
      ...logoes,
      logoOne: branch?.logoOne,
      logoTwo: branch?.logoTwo,
      logoThree: branch?.logoThree,
      logoFour: branch?.logoFour,
    })
    setShowUpdate(true)
  }

  const handleCloseUpdate = () => {
    setShowUpdate(false)
    clearForm()
  }

  //clear field
  const clearForm = () => {
    setBranchId('')
    setBranchName('')
    setBranchAddress('')
    setContactPerson('')
    setContactNo('')
    setEmail('')
    setEmailError('')
    setPrefixOne('')
    setPrefixTwo('')
    setIncludeMonth(false)
    setIncludeYear(false)
    setMonth('')
    setYear('')
    setStartIndex('')
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchBranches(page)
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  //create branch
  const handleAddBranch = async () => {
    //
    if (!branchName) {
      toast.error('Please enter branch name.')
      return
    }

    if (!contactPerson) {
      toast.error('Please enter contact person name.')
      return
    }
    if (!branchAddress) {
      toast.error('Please enter address.')
      return
    }
    if (!contactNo) {
      toast.error('Please enter mobile number.')
      return
    }
    if (!email) {
      toast.error('Please enter email.')
      return
    }

    if (!prefixOne) {
      toast.error('Please enter first prefix')
      return
    }

    // if (!prefixTwo) {
    //   toast.error('Please enter second prefix')
    //   return
    // }

    if (startIndex === '') {
      toast.error('Please enter starting number')
      return
    }

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
    const maxSize = 2 * 1024 * 1024 // 2MB

    const logoOneFile = logoes.logoOne
    const logoTwoFile = logoes.logoTwo
    const logoThreeFile = logoes.logoThree
    const logoFourFile = logoes.logoFour

    //logo one
    if (logoOneFile) {
      if (!allowedTypes.includes(logoOneFile.type)) {
        toast.error('Logo One. Only PNG, JPG are allowed.')
        return
      }

      if (logoOneFile.size > maxSize) {
        toast.error('Logo One size exceeds 2MB limit.')
        return
      }
    }

    //logo two
    if (logoTwoFile) {
      if (!allowedTypes.includes(logoTwoFile.type)) {
        toast.error('Logo Two. Only PNG, JPG are allowed.')
        return
      }

      if (logoTwoFile.size > maxSize) {
        toast.error('Logo Two size exceeds 2MB limit.')
        return
      }
    }

    //logo three
    if (logoThreeFile) {
      if (!allowedTypes.includes(logoThreeFile.type)) {
        toast.error('Logo Three. Only PNG, JPG are allowed.')
        return
      }

      if (logoThreeFile.size > maxSize) {
        toast.error('Logo Three size exceeds 2MB limit.')
        return
      }
    }

    //logo four
    if (logoFourFile) {
      if (!allowedTypes.includes(logoFourFile.type)) {
        toast.error('Logo Four. Only PNG, JPG are allowed.')
        return
      }

      if (logoFourFile.size > maxSize) {
        toast.error('Logo Four size exceeds 2MB limit.')
        return
      }
    }

    const branchData = new FormData()
    branchData.append('branchName', branchName)
    branchData.append('branchAddress', branchAddress)
    branchData.append('contactPerson', contactPerson)
    branchData.append('contactNo', contactNo)
    branchData.append('email', normalizeEmail(email))
    branchData.append('prefixOne', prefixOne)
    branchData.append('prefixTwo', prefixTwo)
    branchData.append('includeMonth', includeMonth)
    branchData.append('includeYear', includeYear)
    branchData.append('startIndex', startIndex)

    if (logoes.logoOne) {
      branchData.append('logoOne', logoes.logoOne)
    }

    if (logoes.logoTwo) {
      branchData.append('logoTwo', logoes.logoTwo)
    }

    if (logoes.logoThree) {
      branchData.append('logoThree', logoes.logoThree)
    }

    if (logoes.logoFour) {
      branchData.append('logoFour', logoes.logoFour)
    }

    try {
      const response = await axios.post(`${BASE_URL}/branch/createBranch`, branchData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const respData = response.data

      if (respData?.success) {
        handleClose()
        toast.success('Branch added successfully!')
        fetchBranches(currentPage)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Internal server error. Try after some time.')
    }
  }

  //update branch
  const handleUpdateBranch = async (e) => {
    if (!branchName) {
      toast.error('Please enter branch name.')
      return
    }

    if (!contactPerson) {
      toast.error('Please enter contact person name.')
      return
    }
    if (!branchAddress) {
      toast.error('Please enter address.')
      return
    }
    if (!contactNo) {
      toast.error('Please enter mobile number.')
      return
    }
    if (!email) {
      toast.error('Please enter email.')
      return
    }

    if (!prefixOne) {
      toast.error('Please enter first prefix')
      return
    }

    // if (!prefixTwo) {
    //   toast.error('Please enter second prefix')
    //   return
    // }

    if (startIndex === '') {
      toast.error('Please enter starting number')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.')
      return
    } else {
      setEmailError('')
    }

    const updatedBranchData = new FormData()
    updatedBranchData.append('branchName', branchName)
    updatedBranchData.append('branchAddress', branchAddress)
    updatedBranchData.append('contactPerson', contactPerson)
    updatedBranchData.append('contactNo', contactNo)
    updatedBranchData.append('email', normalizeEmail(email))
    updatedBranchData.append('prefixOne', prefixOne)
    updatedBranchData.append('prefixTwo', prefixTwo)
    updatedBranchData.append('includeMonth', includeMonth)
    updatedBranchData.append('includeYear', includeYear)
    updatedBranchData.append('startIndex', startIndex)

    if (logoes.logoOne) {
      updatedBranchData.append('logoOne', logoes.logoOne)
    }

    if (logoes.logoTwo) {
      updatedBranchData.append('logoTwo', logoes.logoTwo)
    }

    if (logoes.logoThree) {
      updatedBranchData.append('logoThree', logoes.logoThree)
    }

    if (logoes.logoFour) {
      updatedBranchData.append('logoFour', logoes.logoFour)
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/branch/updateBranch/${branchId}`,
        updatedBranchData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      const respData = response.data

      if (respData?.success) {
        setIsEdit(!isEdit)
        toast.success('Branch updated successfully!')
        handleCloseUpdate()
        fetchBranches(currentPage)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Internal server error. Try after some time.')
    }
  }

  //delete branch
  const handleDeleteBranch = async (branchId) => {
    const result = await MySwal.fire({
      title: 'Delete Branch?',
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

        const response = await axios.delete(`${BASE_URL}/branch/deleteBranch/${branchId}`)
        const respData = response.data

        if (respData?.success) {
          fetchBranches(currentPage)
          toast.success('Branch deleted successfully!')
        }
      }
      catch (error) {
        toast.error(error.response?.data?.message || 'Internal server error. Try after some time.')
      }
    }
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
  }

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
  }

  //icon stylling end

  useEffect(() => {
    fetchBranches(currentPage)
  }, [searchTerm])

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
      <div className="mainTableContainer">
        <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>All Branches</h4>
        <div className='row' style={{ marginBottom: '15px', alignItems: 'center' }}>
          <div className='col-md-6 col-lg-6'>
            <div style={{ width: "50%" }}>
              <InputField label='Search By' value={searchTerm} onChange={(val) => setSearchTerm(val)} placeholder='Search by branch, number, email' />
            </div>
          </div>
          <div className='col-md-6 col-lg-6 mt-4 d-flex justify-content-end' style={{ textAlign: 'right' }}>
            <CustomButton title='Add Branch' icon="tabler_plus.svg" onClick={handleShow} />
          </div>
        </div>
        <div className="table-container mt-4">
          <table className="table table-bordered table-hover align-middle text-center custom-table accessor-table mt-3">
            <thead>
              <tr>
                <th>Sr No</th>
                <th className="special-yellow">Branch Name</th>
                <th className="special-blue">Branch Address</th>
                <th>Contact Person</th>
                <th>Contact No.</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            {branches?.length === 0 ? (
              <div>No branch available</div>
            ) : (
              <tbody>
                {branches?.map((branch, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * limit + index + 1}</td>
                    <td className="special-yellow">{branch.branchName}</td>
                    <td className="special-blue"
                      style={{
                        maxWidth: '150px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={branch.branchAddress}
                    >
                      {branch.branchAddress}
                    </td>
                    <td>{branch.contactPerson}</td>
                    <td>{branch.contactNo}</td>
                    <td>{branch.email}</td>
                    <td>
                      <ActionMenu
                        options={[
                          {
                            icon: 'material-symbols_edit-outline.svg',
                            title: 'Edit Branch',
                            onClick: () => handleShowUpdate(branch),
                          },
                          {
                            icon: 'material-symbols_delete-outline.svg',
                            title: 'Delete Branch',
                            onClick: () => handleDeleteBranch(branch.branchId),
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Modal for Adding Branch */}
        <Modal show={show} onHide={handleClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add Branch</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className='row'>
                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Branch Name"
                    type="text"
                    placeholder="Enter branch name"
                    value={branchName}
                    onChange={(val) => setBranchName(val)}
                  />

                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="Enter Email"
                    value={normalizeEmail(email)}
                    onChange={(val) => setEmail(val)}
                  />
                  {emailError && <Form.Text style={{ color: 'red' }}>{emailError}</Form.Text>}

                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Contact Person"
                    type="text"
                    placeholder="Enter Contact Person"
                    value={contactPerson}
                    onChange={(val) => setContactPerson(val)}
                  />
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Contact No."
                    type="text"
                    placeholder="Enter Contact No."
                    value={contactNo}
                    onChange={(val) => {
                      const value = val.replace(/[^0-9]/g, '') // Allow only numbers
                      setContactNo(value)
                    }}
                    maxLength={10}
                  />

                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Branch Address"
                    type="text"
                    placeholder="Enter Branch Address"
                    value={branchAddress}
                    onChange={(val) => setBranchAddress(val)}
                    maxLength={10}
                  />
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Logo One (PNG, JPG UPTO 2MB)"
                    type="file"
                    value={logoes.logoOne}
                    onChange={(e) => handleImageChange(e)}
                    name="logoOne"
                  />
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Logo Two (PNG, JPG UPTO 2MB)"
                    type="file"
                    value={logoes.logoTwo}
                    onChange={(e) => handleImageChange(e)}
                    name="logoTwo"
                  />
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Logo Three (PNG, JPG UPTO 2MB)"
                    type="file"
                    value={logoes.logoThree}
                    onChange={(e) => handleImageChange(e)}
                    name="logoThree"
                  />
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Logo Four (PNG, JPG UPTO 2MB)"
                    type="file"
                    value={logoes.logoFour}
                    onChange={(e) => handleImageChange(e)}
                    name="logoFour"
                  />
                </div>
                <div className="col-12 px-3 pb-4">
                  <Form.Label className="mb-0 mt-2">
                    {`Certificate Prefix(Example: ${prefixOne}-${prefixTwo}-${month}-${year}-${startIndex})`}
                  </Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <InputField
                      // label="first prefix"
                      type="text"
                      placeholder="Enter first prefix"
                      value={prefixOne}
                      onChange={(val) => {
                        const value = val.toUpperCase().replace(/[^A-Z]/g, '')
                        setPrefixOne(value)
                      }}
                      maxLength={4}
                    />
                    <InputField
                      // label="first prefix"
                      type="text"
                      placeholder="Enter second prefix"
                      value={prefixTwo}
                      onChange={(val) => {
                        const value = val.toUpperCase().replace(/[^A-Z]/g, '')
                        setPrefixTwo(value)
                      }}
                      maxLength={4}
                    />

                    <Form.Check
                      type="checkbox"
                      label="Month"
                      checked={includeMonth}
                      onChange={(e) => {
                        setIncludeMonth(e.target.checked)
                        if (e.target.checked) {
                          setMonth(
                            new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase(),
                          ) // Example: "Feb"
                        } else {
                          setMonth('')
                        }
                      }}
                    />
                    <Form.Check
                      type="checkbox"
                      label="Year"
                      checked={includeYear}
                      onChange={(e) => {
                        setIncludeYear(e.target.checked)
                        if (e.target.checked) {
                          setYear(new Date().getFullYear())
                        } else {
                          setYear('')
                        }
                      }}
                    />
                    <InputField
                      // label="first prefix"
                      type="text"
                      placeholder="Enter Start Index"
                      value={startIndex}
                      onChange={(val) => {
                        const value = val.toUpperCase().replace(/[^0-9]/g, '')
                        setStartIndex(value)
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex mt-4 px-3 pb-4 justify-content-end">
                <CustomButton title="Add Branch" icon="tabler_plus.svg" onClick={handleAddBranch} />
              </div>

            </form>
          </Modal.Body>
        </Modal>

        {/* Modal for Updating Branch */}
        <Modal show={showUpdate} onHide={handleCloseUpdate} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Update Branch</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className='row'>
                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Branch Name"
                    type="text"
                    placeholder="Enter branch name"
                    value={branchName}
                    onChange={(val) => setBranchName(val)}
                    disabled={!isEdit}
                  />
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="Enter email"
                    value={normalizeEmail(email)}
                    onChange={(val) => setEmail(val)}
                    disabled={!isEdit}
                  />
                  {emailError && <div style={{ color: 'red', fontSize: '13px' }}>{emailError}</div>}
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Contact Person"
                    type="text"
                    placeholder="Enter contact person"
                    value={contactPerson}
                    onChange={(val) => setContactPerson(val)}
                    disabled={!isEdit}
                  />
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Contact No."
                    type="text"
                    placeholder="Enter contact number"
                    value={contactNo}
                    onChange={(val) => setContactNo(val.replace(/[^0-9]/g, ''))}
                    disabled={!isEdit}
                  />
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <InputField
                    label="Branch Address"
                    type="text"
                    placeholder="Enter branch address"
                    value={branchAddress}
                    onChange={(val) => setBranchAddress(val)}
                    disabled={!isEdit}
                  />
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <Form.Group controlId="logoOne">
                    {!isEdit ? (
                      <div className='row'>
                        <div className="col-12">
                          <label style={{ fontSize: "14px" }}>Logo One</label>
                        </div>
                        <div className="d-flex justify-content-center">
                          <img
                            src={`${BASE_URL}/${logoes.logoOne}`}
                            alt="Logo One"
                            style={{
                              height: '60px',
                              marginLeft: '2px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <InputField
                        label="Logo One (PNG, JPG UPTO 2MB)"
                        type="file"
                        value={logoes.logoOne}
                        onChange={(e) => handleImageChange(e)}
                        name="logoOne"
                      />
                    )}
                  </Form.Group>
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <Form.Group controlId="logoTwo">
                    {!isEdit ? (
                      <div className='row'>
                        <div className="col-12">
                          <label style={{ fontSize: "14px" }}>Logo Two</label>
                        </div>
                        <div className="d-flex justify-content-center">
                          <img
                            src={`${BASE_URL}/${logoes.logoTwo}`}
                            alt="Logo Two"
                            style={{
                              height: '60px',
                              marginLeft: '2px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <InputField
                        label="Logo Two (PNG, JPG UPTO 2MB)"
                        type="file"
                        value={logoes.logoTwo}
                        onChange={(e) => handleImageChange(e)}
                        name="logoTwo"
                      />
                    )}
                  </Form.Group>
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <Form.Group controlId="logoThree">
                    {!isEdit ? (
                      <div className='row'>
                        <div className="col-12">
                          <label style={{ fontSize: "14px" }}>Logo Three</label>
                        </div>
                        <div className="d-flex justify-content-center">
                          <img
                            src={`${BASE_URL}/${logoes.logoThree}`}
                            alt="Logo Three"
                            style={{
                              height: '60px',
                              marginLeft: '2px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                          /></div></div>
                    ) : (
                      <InputField
                        label="Logo Three (PNG, JPG UPTO 2MB)"
                        type="file"
                        value={logoes.logoThree}
                        onChange={(e) => handleImageChange(e)}
                        name="logoThree"
                      />
                    )}
                  </Form.Group>
                </div>

                <div className="col-md-6 col-lg-4 px-3 pb-4">
                  <Form.Group controlId="logoFour">
                    {!isEdit ? (
                      <div className='row'>
                        <div className="col-12">
                          <label style={{ fontSize: "14px" }}>Logo Four</label>
                        </div>
                        <div className="d-flex justify-content-center">
                          <img
                            src={`${BASE_URL}/${logoes.logoFour}`}
                            alt="Logo Four"
                            style={{
                              height: '60px',
                              marginLeft: '2px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                          /></div>
                      </div>
                    ) : (
                      <InputField
                        label="Logo Four (PNG, JPG UPTO 2MB)"
                        type="file"
                        value={logoes.logoFour}
                        onChange={(e) => handleImageChange(e)}
                        name="logoFour"
                      />
                    )}
                  </Form.Group>
                </div>
                <div className="col-12 px-3 pb-4">
                  <Form.Group>
                    <Form.Label className="mb-0 mt-2">
                      {`Certificate Prefix (Example: ${prefixOne || ''}-${prefixTwo || ''}-${month}-${year}-${startIndex})`}
                    </Form.Label>
                    <div className="d-flex gap-2 align-items-center">
                      <InputField
                        type="text"
                        placeholder="Enter first prefix"
                        value={prefixOne}
                        onChange={(val) =>
                          setPrefixOne(val.toUpperCase().replace(/[^A-Z]/g, ''))
                        }
                        maxLength={4}
                        disabled={!isEdit}
                      />

                      <InputField
                        type="text"
                        placeholder="Enter second prefix"
                        value={prefixTwo}
                        onChange={(val) =>
                          setPrefixTwo(val.toUpperCase().replace(/[^A-Z]/g, ''))
                        }
                        maxLength={4}
                        disabled={!isEdit}
                      />

                      <Form.Check
                        type="checkbox"
                        label="Month"
                        checked={includeMonth}
                        readOnly={!isEdit}
                        onChange={(e) => {
                          setIncludeMonth(e.target.checked)
                          setMonth(
                            e.target.checked
                              ? new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase()
                              : ''
                          )
                        }}
                      />

                      <Form.Check
                        type="checkbox"
                        label="Year"
                        checked={includeYear}
                        readOnly={!isEdit}
                        onChange={(e) => {
                          setIncludeYear(e.target.checked)
                          setYear(e.target.checked ? new Date().getFullYear() : '')
                        }}
                      />

                      <InputField
                        type="text"
                        placeholder="Enter starting index"
                        value={startIndex}
                        onChange={(val) => setStartIndex(val.replace(/[^0-9]/g, ''))}
                        disabled={!isEdit}
                      />
                    </div>
                  </Form.Group>
                </div>
              </div>
            </form>

            <div className="row d-flex mt-4 px-3 pb-4 justify-content-end text-end mb-3">
              <CustomButton
                title={isEdit ? 'Save Changes' : 'Edit'}
                icon={isEdit ? 'Save_w.svg' : 'Edit_Pencil_w.svg'}
                onClick={() => {
                  isEdit ? handleUpdateBranch() : setIsEdit(true)
                }}
              />
            </div>

          </Modal.Body>
        </Modal>
      </div>
    </>
  )
}

export default AllBranches

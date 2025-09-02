import React, { useEffect, useState } from 'react'
import { Form, Button, Row, Col, Container, InputGroup } from 'react-bootstrap'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css' // Toastify CSS
import '../../SidebarCss/Form.css' // Additional CSS for styling
import { BASE_URL } from '../../../BaseURL' // Your base URL
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import CustomButton from '../../../components/custom/CustomButton';
import InputField from '../../../components/custom/InputField';
import Date_Picker from '../../../components/custom/Date_Picker';
import { normalizeEmail } from '../../../utils/dataHelpers';

const UpdateAccessor = () => {
  const location = useLocation()
  const { accessorId } = location?.state
  // const { accessorId } = useParams(); // Get accessorId from URL parameters
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    accessorEmail: '',
    accessorMobNo: '',
    accessorName: '',
    accessorDob: '',
    accessorGender: '',
    accessorJoinDate: '',
    accessorAddr: '',
    accessorPassword: '',
    accessorProfile: null, // To store profile image
  })
  const [loading, setLoading] = useState(false) // Loading state for form submission
  const [imagePreview, setImagePreview] = useState('') // Image preview for profile picture

  const [showPassword, setShowPassword] = useState(false)


  // Fetch accessor details on component mount
  useEffect(() => {
    const fetchAccessorDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/accessor/getAccessorById/${accessorId}`)
        const respData = response.data

        if (respData?.success) {
          const accessorData = respData?.accessor
          setFormData({
            accessorEmail: normalizeEmail(accessorData?.accessorEmail) || '',
            accessorMobNo: accessorData?.accessorMobNo || '',
            accessorName: accessorData?.accessorName || '',
            accessorDob: accessorData?.accessorDob?.split('T')[0] || '', // Format date
            accessorGender: accessorData?.accessorGender || '',
            accessorJoinDate: accessorData?.accessorJoinDate?.split('T')[0] || '', // Format date
            accessorAddr: accessorData?.accessorAddr || '',
            accessorPassword: accessorData?.accessorPassword || '',
            accessorProfile: null, // Keep profile image as null initially
          })

          // Set image preview if accessorProfile exists
          if (accessorData?.accessorProfile) {
            setImagePreview(`${BASE_URL}/${accessorData.accessorProfile}`)
          }
        }
      } catch (error) {
        toast.error('Error fetching accessor details.', { position: 'top-center' })
      }
    }

    fetchAccessorDetails()
  }, [accessorId])

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle file input change for profile image
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        accessorProfile: file, // Store uploaded file
      }))

      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result) // Display image preview
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true) // Show loading state

    // Validate mobile number length
    if (formData.accessorMobNo.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits.', { position: 'top-center' })
      setLoading(false) // Reset loading state
      return
    }

    // Prepare form data to send to the backend
    const formDataToSend = new FormData()
    formDataToSend.append('accessorEmail', normalizeEmail(formData.accessorEmail))
    formDataToSend.append('accessorMobNo', formData.accessorMobNo)
    formDataToSend.append('accessorName', formData.accessorName)
    formDataToSend.append('accessorDob', formData.accessorDob)
    formDataToSend.append('accessorGender', formData.accessorGender)
    formDataToSend.append('accessorJoinDate', formData.accessorJoinDate)
    formDataToSend.append('accessorAddr', formData.accessorAddr)
    formDataToSend.append('accessorPassword', formData.accessorPassword)

    if (formData.accessorProfile) {
      formDataToSend.append('accessorProfile', formData.accessorProfile) // Append profile image if uploaded
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/accessor/updateAccessorById/${accessorId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      if (response.data.success) {
        toast.success('Accessor updated successfully!', { position: 'top-center' })
        // setTimeout(() => {
        //   navigate('/accessor-details') // Redirect to accessor details page after a brief delay
        // }, 2000) 
      } else {
        toast.error('Error updating accessor. Please check your details and try again.', {
          position: 'top-center',
        })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    } finally {
      setLoading(false) // Reset loading state at the end
    }
  }

  return (
    <Container className="mt-4">
      <div className="container shadow p-4 rounded" style={{width: "85%", backgroundColor:"white"}}>
        <h4 style={{fontSize: "28px"}} className="text-center mt-4 mb-4 pb-2">Update Examiner</h4>

        <form>
          <div className="row px-4">
            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter Full Name"
                value={formData.accessorName}
                onChange={(val) => setFormData({ ...formData, accessorName: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <Date_Picker
                label="Joining Date"
                value={formData.accessorJoinDate ? new Date(formData.accessorJoinDate):null}
                onChange={(val) => setFormData({ ...formData, accessorJoinDate: val })}
                max="2099-12-31"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Email"
                type="email"
                placeholder="Enter Email Here"
                value={normalizeEmail(formData.accessorEmail)}
                onChange={(val) => setFormData({ ...formData, accessorEmail: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Mobile Number"
                type="text"
                placeholder="Enter Mobile Number"
                value={formData.accessorMobNo}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, accessorMobNo: val.replace(/\D/g, '') }))
                }
                required
                maxLength={10}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <Date_Picker
                label="Date of Birth"
                value={formData.accessorDob ? new Date(formData.accessorDob): null}
                onChange={(val) => setFormData({ ...formData, accessorDob: val })}
                max="2099-12-31"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Gender"
                type="select"
                value={formData.accessorGender}
                onChange={(val) => setFormData({ ...formData, accessorGender: val })}
                required
                options={[
                  { label: 'Select Gender', value: '' },
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Address"
                type="text"
                placeholder="Enter Address Here"
                value={formData.accessorAddr}
                onChange={(val) => setFormData({ ...formData, accessorAddr: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <label>Password</label>
              <div className="dd-mm-yyyy-parent my-2" style={{ padding: 0 }}>
                <div className="position-relative w-100">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="custom-date-input"
                    placeholder="Enter password"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      height: '100%',
                      fontSize: '16px',
                      margin: '2px 2px',
                      color: 'rgba(0,0,0,0.6)',
                      borderRadius: '40px',
                      padding: '10px 20px',
                    }}
                    value={formData.accessorPassword}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: 'accessorPassword',
                          value: e.target.value.replace(/\s/g, ''),
                        },
                      })
                    }
                    required
                  />
                  <span
                    className="position-absolute top-50 end-0 translate-middle-y me-3"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Profile Image"
                type="file"
                accept="image/*"
                name="accessorProfile"
                value={formData.accessorProfile}
                onChange={handleFileChange}
              />
            </div>

            <div className="col-12 mt-4 px-4 pb-4 d-flex justify-content-end text-center">
              <CustomButton
                title={loading ? 'Updating...' : 'Update Examiner'}
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                icon="material-symbols_edit-outline.svg"
                variant='outline'
              />
            </div>
          </div>
        </form>

      </div>
      <Toaster
        position="top-center"
        reverseOrder={true}
      />{' '}
      {/* Ensure toast container is properly set */}
    </Container>
  )
}

export default UpdateAccessor

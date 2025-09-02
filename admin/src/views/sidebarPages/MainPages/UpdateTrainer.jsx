import React, { useEffect, useState } from 'react'
import { Form, Button, Row, Col, Container, InputGroup } from 'react-bootstrap'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css' // Toastify CSS
import { BASE_URL } from '../../../BaseURL' // Your base URL
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import Date_Picker from '../../../components/custom/Date_Picker';
import InputField from '../../../components/custom/InputField';
import CustomButton from '../../../components/custom/CustomButton';
import { normalizeEmail, toISODate } from '../../../utils/dataHelpers';

const UpdateTrainer = () => {
  const location = useLocation()
  const { trainerId } = location?.state
  // const { trainerId } = useParams(); // Get trainerId from URL parameters
  const navigate = useNavigate() // For navigation after update

  const [trainerData, setTrainerData] = useState({
    trainerEmail: '',
    trainerMobNo: '',
    trainerName: '',
    trainerDob: '',
    trainerGender: '',
    trainerJoinDate: '',
    trainerEdu: '',
    trainerAddr: '',
    trainerPassword: '',
    trainerProfile: null, // To store profile image
    // trainerCourse: "", // To store the selected course
  })

  const [loading, setLoading] = useState(false) // Loading state for form submission
  const [imagePreview, setImagePreview] = useState('') // Image preview for profile picture
  const [showPassword, setShowPassword] = useState(false)

  // Fetch existing trainer data
  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/trainer/getTrainerById/${trainerId}`) // Use BASE_URL here
        const trainerData = response.data.trainer

        setTrainerData((prev) => ({
          ...prev,
          trainerEmail: normalizeEmail(trainerData.trainerEmail) || '',
          trainerMobNo: trainerData.trainerMobNo || '',
          trainerName: trainerData.trainerName || '',
          trainerDob: trainerData.trainerDob?.split('T')[0] || '', // Format date
          trainerGender: trainerData.trainerGender || '',
          trainerJoinDate: trainerData.trainerJoinDate?.split('T')[0] || '', // Format date
          trainerEdu: trainerData.trainerEdu || '',
          trainerAddr: trainerData.trainerAddr || '',
          trainerPassword: trainerData?.trainerPassword || '',
          // trainerCourse: trainerData.trainerCourse || '', // Set trainer course
        }))

        // Set image preview if trainerProfile exists
        if (trainerData.trainerProfile) {
          setImagePreview(`${BASE_URL}/${trainerData.trainerProfile}`)
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
      }
    }

    fetchTrainer()
  }, [trainerId])

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setTrainerData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle file input change for profile image
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setTrainerData((prev) => ({
        ...prev,
        trainerProfile: file, // Store uploaded file
      }))

      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result) // Display image preview
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true) // Show loading state

    // Validate mobile number length
    if (trainerData.trainerMobNo.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits.', { position: 'top-center' })
      setLoading(false) // Reset loading state
      return
    }

    // Prepare form data to send to the backend
    const formDataToSend = new FormData()
    formDataToSend.append('trainerEmail', normalizeEmail(trainerData.trainerEmail))
    formDataToSend.append('trainerMobNo', trainerData.trainerMobNo)
    formDataToSend.append('trainerName', trainerData.trainerName)
    formDataToSend.append('trainerDob', trainerData.trainerDob)
    formDataToSend.append('trainerGender', trainerData.trainerGender)
    formDataToSend.append('trainerJoinDate', trainerData.trainerJoinDate)
    formDataToSend.append('trainerEdu', trainerData.trainerEdu)
    formDataToSend.append('trainerAddr', trainerData.trainerAddr)
    formDataToSend.append('trainerPassword', trainerData.trainerPassword)
    // formDataToSend.append('trainerCourse', trainerData.trainerCourse); // Append selected course

    if (trainerData.trainerProfile) {
      formDataToSend.append('file', trainerData.trainerProfile) // Append profile image if uploaded
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/trainer/updateTrainerById/${trainerId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      if (response.data.success) {
        toast.success('Trainer updated successfully!', { position: 'top-center' })
        // setTimeout(() => {
        //   navigate('/trainer-details') // Redirect to the trainers list page after a brief delay
        // }, 2000) 
      } else {
        toast.error('Error updating trainer. Please check your details and try again.', {
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
    <div className="container shadow p-4 rounded mt-4" style={{ width: "85%", backgroundColor: "white" }}>
      <div>
        <h4 style={{ fontSize: "28px" }} className="text-center mt-4 mb-4 pb-2">Update Trainer</h4>
        <form>
          <div className="row px-4">
            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter Full Name"
                value={trainerData.trainerName}
                onChange={(val) => setTrainerData({ ...trainerData, trainerName: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <Date_Picker
                label="Joining Date"
                value={trainerData.trainerJoinDate ? new Date(trainerData.trainerJoinDate) : null}
                onChange={(val) => setTrainerData({ ...trainerData, trainerJoinDate: val })}
                max="2099-12-31"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Email"
                type="email"
                placeholder="Enter Email Here"
                value={normalizeEmail(trainerData.trainerEmail)}
                onChange={(val) => setTrainerData({ ...trainerData, trainerEmail: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Mobile Number"
                type="text"
                placeholder="Enter Mobile Number"
                value={trainerData.trainerMobNo}
                onChange={(val) =>
                  setTrainerData({ ...trainerData, trainerMobNo: val.replace(/\D/g, '') })
                }
                maxLength={10}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <Date_Picker
                label="Date of Birth"
                value={trainerData.trainerDob ? new Date(trainerData.trainerDob): null}
                onChange={(val) => setTrainerData({ ...trainerData, trainerDob: val })}
                max="2099-12-31"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Gender"
                type="select"
                value={trainerData.trainerGender}
                onChange={(val) => setTrainerData({ ...trainerData, trainerGender: val })}
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
                label="Education"
                type="text"
                placeholder="Enter Education Here"
                value={trainerData.trainerEdu}
                onChange={(val) => setTrainerData({ ...trainerData, trainerEdu: val })}
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
                    placeholder="Enter Password"
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
                    value={trainerData.trainerPassword}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: 'trainerPassword',
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
                label="Address"
                type="text"
                placeholder="Enter Address Here"
                value={trainerData.trainerAddr}
                onChange={(val) => setTrainerData({ ...trainerData, trainerAddr: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Profile Image"
                type="file"
                name="trainerProfile"
                value={trainerData.trainerProfile}
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>

            <div className="col-12 text-center mt-2 px-4 pb-4 d-flex justify-content-end">
              <CustomButton
                title={loading ? 'Updating...' : 'Update Trainer'}
                onClick={handleSubmit}
                icon="material-symbols_edit-outline.svg"
                disabled={loading}
                variant='outline'
              />
            </div>
          </div>
        </form>

      </div>
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  )
}

export default UpdateTrainer

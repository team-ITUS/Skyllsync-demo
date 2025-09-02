import React, { useState } from 'react'
import { Form, Button, Row, Col, Container } from 'react-bootstrap'
import { BASE_URL } from '../../../BaseURL' // Import the BASE_URL
import '../../SidebarCss/Form.css' // Add this for additional styling
import axios from 'axios' // Add Axios for making API requests
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css' // Import Toastify CSS
import { useNavigate } from 'react-router-dom'
import InputField from '../../../components/custom/InputField'
import Date_Picker from '../../../components/custom/Date_Picker'
import CustomButton from '../../../components/custom/CustomButton'
import { normalizeEmail } from '../../../utils/dataHelpers'

const AddTrainer = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    trainerEmail: '',
    trainerMobNo: '',
    trainerName: '',
    trainerDob: '',
    trainerGender: '',
    trainerJoinDate: '',
    trainerEdu: '',
    // trainerCourse: '',
    trainerAddr: '',
    trainerProfile: null, // To store the uploaded photo
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      trainerProfile: e.target.files[0], // Store the uploaded photo
    }))
  }

  const handleSubmit = async () => {
    if (!formData.trainerEmail) {
      toast.error('Please enter email.')
      return
    }
    if (!formData.trainerMobNo) {
      toast.error('Please enter mobile number.')
      return
    }
    if (!formData.trainerName) {
      toast.error('Please enter name.')
      return
    }
    if (!formData.trainerDob) {
      toast.error('Please enter date of birth.')
      return
    }
    if (!formData.trainerGender) {
      toast.error('Please select gender.')
      return
    }
    if (!formData.trainerJoinDate) {
      toast.error('Please enter joining date.')
      return
    }
    if (!formData.trainerEdu) {
      toast.error('Please enter education.')
      return
    }

    // Validate mobile number length
    if (formData.trainerMobNo.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits.', { position: 'top-center' })
      return
    }

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
    const maxSize = 2 * 1024 * 1024 // 2MB

    const trainerProfile = formData.trainerProfile

    if (trainerProfile) {
      if (!allowedTypes.includes(trainerProfile.type)) {
        toast.error('Profile. Only PNG, JPG are allowed.')
        return
      }

      if (trainerProfile.size > maxSize) {
        toast.error('Profile size exceeds 2MB limit.')
        return
      }
    }

    // Prepare form data to send to the backend
    const formDataToSend = new FormData()
    formDataToSend.append('trainerEmail', normalizeEmail(formData.trainerEmail))
    formDataToSend.append('trainerMobNo', formData.trainerMobNo)
    formDataToSend.append('trainerName', formData.trainerName)
    formDataToSend.append('trainerDob', formData.trainerDob)
    formDataToSend.append('trainerGender', formData.trainerGender)
    formDataToSend.append('trainerJoinDate', formData.trainerJoinDate)
    formDataToSend.append('trainerEdu', formData.trainerEdu)
    // formDataToSend.append('trainerCourse', formData.trainerCourse);
    formDataToSend.append('trainerAddr', formData.trainerAddr)

    if (formData.trainerProfile) {
      formDataToSend.append('file', formData.trainerProfile) // Append photo if uploaded
    }

    try {
      const response = await axios.post(`${BASE_URL}/admin/createTrainer`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Store the response data in a variable
      const responseData = response.data

      // Check if success is true in the response
      if (responseData.success === true) {
        toast.success('Trainer added successfully!', { position: 'top-center' })

        // Clear the form after successful submission
        setFormData({
          trainerEmail: '',
          trainerMobNo: '',
          trainerName: '',
          trainerDob: '',
          trainerGender: '',
          trainerJoinDate: '',
          trainerEdu: '',
          // trainerCourse: '',
          trainerAddr: '',
          trainerProfile: null,
        })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    }
  }

  return (
    <div className="container mt-4 shadow p-5 rounded" style={{width: "85%", backgroundColor:"white"}}>
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
      <div>
        <div>
        <h4 className="text-center mt-2 mb-4 pb-2" style={{fontSize: "28px"}}>Add Trainer</h4>
        <form>
          <div className="row px-4">
            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter Full Name"
                value={formData.trainerName}
                onChange={(val) => setFormData({ ...formData, trainerName: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <Date_Picker
                label="Joining Date"
                value={formData.trainerJoinDate}
                onChange={(val) => setFormData({ ...formData, trainerJoinDate: val })}
                max="2099-12-31"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Email"
                type="email"
                placeholder="Enter Email Here"
                value={normalizeEmail(formData.trainerEmail)}
                onChange={(val) => setFormData({ ...formData, trainerEmail: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Mobile Number"
                type="text"
                placeholder="Enter Mobile Number"
                value={formData.trainerMobNo}
                onChange={(val) =>
                  setFormData({ ...formData, trainerMobNo: val.replace(/\D/g, '') })
                }
                required
                maxLength={10}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <Date_Picker
                label="Date of Birth"
                value={formData.trainerDob}
                onChange={(val) => setFormData({ ...formData, trainerDob: val })}
                max="2099-12-31"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Gender"
                type="select"
                value={formData.trainerGender}
                onChange={(val) => setFormData({ ...formData, trainerGender: val })}
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
                placeholder="Enter Education Details"
                value={formData.trainerEdu}
                onChange={(val) => setFormData({ ...formData, trainerEdu: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Address"
                type="text"
                placeholder="Enter Address"
                value={formData.trainerAddr}
                onChange={(val) => setFormData({ ...formData, trainerAddr: val })}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Upload Photo (PNG, JPG UPTO 2MB)"
                type="file"
                name="file"
                value={formData.file}
                onChange={handleFileChange}
                accept="image/*"
                required
              />
            </div>

            <div className="col-12 d-flex justify-content-end text-center px-4 mt-4">
              <CustomButton title="Add Trainer" icon="tabler_plus.svg" onClick={handleSubmit} />
            </div>
          </div>
        </form>

      </div>
      </div>
    </div>
  )
}

export default AddTrainer

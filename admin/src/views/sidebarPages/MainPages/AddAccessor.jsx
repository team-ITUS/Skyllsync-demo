import React, { useState } from 'react'
import { Form, Button, Row, Col, Container } from 'react-bootstrap'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';

import '../../SidebarCss/Form.css' // Add this for additional styling
import { BASE_URL } from '../../../BaseURL'
import { useNavigate } from 'react-router-dom'
import InputField from '../../../components/custom/InputField';
import Date_Picker from '../../../components/custom/Date_Picker';
import CustomButton from '../../../components/custom/CustomButton';
import { normalizeEmail } from '../../../utils/dataHelpers';

const AddAccessor = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    accessorEmail: '',
    accessorMobNo: '',
    accessorName: '',
    accessorDob: '',
    accessorGender: '',
    accessorJoinDate: '',
    accessorAddr: '',
    accessorProfile: null,
    signature: null,
  })
  const [loading, setLoading] = useState(false) // Loading state

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (event, type) => {
    const file = event.target.files[0]
    if (type === 'profile') {
      setFormData((prev) => ({
        ...prev,
        ['accessorProfile']: file,
      }))
    } else if (type === 'signature') {
      setFormData((prev) => ({
        ...prev,
        ['signature']: file,
      }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.accessorEmail) {
      toast.error('Please enter email.')
      return
    }
    if (!formData.accessorName) {
      toast.error('Please enter name.')
      return
    }
    if (!formData.accessorDob) {
      toast.error('Please enter date of birth.')
      return
    }
    if (!formData.accessorGender) {
      toast.error('Please select gender.')
      return
    }
    if (!formData.accessorJoinDate) {
      toast.error('Please enter joining date.')
      return
    }
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
    const maxSize = 2 * 1024 * 1024 // 2MB

    const accProfile = formData.accessorProfile
    const accSign = formData.signature

    if (accProfile) {
      if (!allowedTypes.includes(accProfile.type)) {
        toast.error('Profile. Only PNG, JPG are allowed.')
        return
      }

      if (accProfile.size > maxSize) {
        toast.error('Profile size exceeds 2MB limit.')
        return
      }
    }

    if (accSign) {
      if (!allowedTypes.includes(accSign.type)) {
        toast.error('Signature. Only PNG, JPG are allowed.')
        return
      }

      if (accSign.size > maxSize) {
        toast.error('Signature size exceeds 2MB limit.')
        return
      }
    }

    setLoading(true) // Set loading to true when starting the submission

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

    if (formData.accessorProfile) {
      formDataToSend.append('imagePath', formData.accessorProfile) // Append photo if uploaded
    }

    if (formData.signature) {
      formDataToSend.append('signature', formData.signature) // Append photo if uploaded
    }

    try {
      const response = await axios.post(`${BASE_URL}/admin/createAccessor`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Store the response data in a variable
      const responseData = response.data

      // Check if success is true in the response
      if (responseData?.success) {
        toast.success('Accessor added successfully!', { position: 'top-center' })

        // Clear the form after successful submission
        setFormData({
          accessorEmail: '',
          accessorMobNo: '',
          accessorName: '',
          accessorDob: '',
          accessorGender: '',
          accessorJoinDate: '',
          accessorAddr: '',
          accessorProfile: null,
        })
        // navigate('/accessor-details');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    } finally {
      setLoading(false) // Always reset loading state at the end
    }
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
      <div>
        <div className="container shadow mt-4 px-4 pt-4 rounded" style={{width: "85%", backgroundColor:"white"}}>
          <h4 className="text-center mt-4 mb-4 pb-2" style={{fontSize: "28px"}}>Add Examiner</h4>
          <Form>
            <div className="row px-5">
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
                  value={formData.accessorJoinDate}
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
                    setFormData({ ...formData, accessorMobNo: val.replace(/\D/g, '') })
                  }
                  required
                  maxLength={10}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
                <Date_Picker
                  label="Date of Birth"
                  value={formData.accessorDob}
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
                  placeholder="Enter Address"
                  value={formData.accessorAddr}
                  onChange={(val) => setFormData({ ...formData, accessorAddr: val })}
                  required
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
                <InputField
                  label="Upload Profile (PNG, JPG UPTO 2MB)"
                  type="file"
                  name="accessorProfile"
                  value={formData.accessorProfile}
                  onChange={(e) => handleFileChange(e, 'profile')}
                  accept="image/*"
                  required
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
                <InputField
                  label="Upload Signature (PNG, JPG UPTO 2MB)"
                  type="file"
                  name="signature"
                  value={formData.signature}
                  onChange={(e) => handleFileChange(e, 'signature')}
                  accept="image/*"
                  required
                />
              </div>

              <div className="col-12 text-center d-flex justify-content-end mb-4 px-4 pb-4">
                <CustomButton
                  title={loading ? 'Saving...' : 'Add Examiner'}
                  icon="tabler_plus.svg"
                  onClick={handleSubmit}
                  disabled={loading}
                />
              </div>
            </div>
          </Form>

        </div>
      </div>
    </>
  )
}

export default AddAccessor

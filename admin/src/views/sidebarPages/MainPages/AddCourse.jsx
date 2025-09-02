import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Container, Form } from 'react-bootstrap'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

import InputField from '../../../components/custom/InputField'
import Date_Picker from '../../../components/custom/Date_Picker'
import CustomButton from '../../../components/custom/CustomButton'

import { BASE_URL } from '../../../BaseURL'
import '../../SidebarCss/Form.css'

const CreateCourse = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    courseName: '',
    courseDesc: '',
    creatorName: '',
    createDate: '',
    status: 'active',
    noOfLectures: '',
    courseLevel: 'beginner',
    courseCategory: '',
    courseThumbnail: '',
  })

  const handleSubmit = async () => {
    const file = formData.courseThumbnail

    if (file) {
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PNG, JPG are allowed.')
        return
      }

      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error('File size exceeds 2MB limit.')
        return
      }
    }

    try {
      const frmData = new FormData()
      frmData.append('courseName', formData.courseName)
      frmData.append('courseDesc', formData.courseDesc)
      frmData.append('creatorName', formData.creatorName)
      frmData.append('creatorId', 'admin001')
      frmData.append('catId', 'admin001')
      frmData.append('createDate', formData.createDate)
      frmData.append('courseLevel', formData.courseLevel)
      frmData.append('courseCategory', formData.courseCategory)
      frmData.append('file', formData.courseThumbnail)

      const response = await axios.post(`${BASE_URL}/course/createCourse`, frmData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data?.success) {
        toast.success(response.data.message || 'Course created successfully!')
        setFormData({
          courseName: '',
          courseDesc: '',
          creatorName: '',
          createDate: '',
          status: 'unapprove',
          noOfLectures: '',
          courseLevel: 'beginner',
          courseCategory: 'Web Development',
          courseThumbnail: '',
        })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try again later.')
    }
  }

  return (
    <Container className="mt-4">
      <Toaster position="top-center" reverseOrder={true} />
      <div className="container shadow p-5 rounded" style={{width: "85%", backgroundColor:"white"}}>
        <h4 className="text-center mb-4" style={{fontSize: "28px"}}>Create Course</h4>
        <form style={{marginTop:"36px"}} className='mx-1'>
          <div className='row'>
            <div className="col-lg-4 px-4 pb-4">
              <InputField
                label="Course Name"
                type="text"
                value={formData.courseName}
                onChange={(val) => setFormData({ ...formData, courseName: val })}
                placeholder="Enter Course Name"
              />
            </div>

            <div className="col-lg-4 px-4 pb-4">
              <InputField
                label="Creator Name"
                type="text"
                value={formData.creatorName}
                onChange={(val) => setFormData({ ...formData, creatorName: val })}
                placeholder="Enter Creator Name"
              />
            </div>

            <div className="col-lg-4 px-4 pb-4">
              <Date_Picker
                label="Create Date"
                value={formData.createDate}
                placeholder="Select Create Date"
                onChange={(val) => setFormData({ ...formData, createDate: val })}
              />
            </div>

            <div className="col-lg-4 px-4 pb-4">
              <InputField
                label="Number of Lectures"
                type="number"
                value={formData.noOfLectures}
                onChange={(val) => setFormData({ ...formData, noOfLectures: val })}
                placeholder="Enter Number of Lectures"
              />
            </div>

            <div className="col-lg-4 px-4 pb-4">
              <InputField
                label="Course Level"
                type="select"
                value={formData.courseLevel}
                onChange={(val) => setFormData({ ...formData, courseLevel: val })}
                options={[
                  { label: 'Beginner', value: 'beginner' },
                  { label: 'Intermediate', value: 'intermediate' },
                  { label: 'Advanced', value: 'advanced' },
                ]}
              />
            </div>

            <div className="col-lg-4 px-4 pb-4">
              <InputField
                label="Course Category"
                type="text"
                value={formData.courseCategory}
                onChange={(val) => setFormData({ ...formData, courseCategory: val })}
                placeholder="Enter Course Category"
              />
            </div>

            <div className="col-lg-4 px-4 pb-4">
              <InputField
                label="Course Description"
                type="text"
                value={formData.courseDesc}
                onChange={(val) => setFormData({ ...formData, courseDesc: val })}
                placeholder="Enter Course Description"
              />
            </div>

            <div className="col-lg-4 px-4 pb-4">
              <InputField
                label="Course Thumbnail (PNG, JPG up to 2MB)"
                type="file"
                value={formData.courseThumbnail}
                onChange={(e) => setFormData({ ...formData, courseThumbnail: e.target.files[0] })}
              />
            </div>
          </div>

          <div className="text-center mt-4 d-flex justify-content-end">
            <CustomButton onClick={handleSubmit} icon="tabler_plus.svg" title="Create Course" />
          </div>
        </form>
      </div>
    </Container>
  )
}

export default CreateCourse

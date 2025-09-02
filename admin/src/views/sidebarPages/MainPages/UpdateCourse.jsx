import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Container } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import '../../SidebarCss/Form.css' // Assuming custom CSS for consistent styling
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom' // Import useNavigate
import { BASE_URL } from '../../../BaseURL'
import InputField from '../../../components/custom/InputField';
import CustomButton from '../../../components/custom/CustomButton';
import Date_Picker from '../../../components/custom/Date_Picker';
import { toISODate } from '../../../utils/dataHelpers';

const UpdateCourse = () => {
  const [role, setRole] = useState(localStorage.getItem('role'))
  const { state } = useLocation()
  const navigate = useNavigate() // Initialize useNavigate

  const [formData, setFormData] = useState({
    courseName: '',
    creatorName: '',
    createDate: '',
    noOfLectures: '',
    courseLevel: '',
    courseCategory: '',
    courseDesc: '',
    courseThumbnail: null, // Initialize courseThumbnail as null for file upload
  })

  const [imagePreview, setImagePreview] = useState(null) // Add state for image preview

  useEffect(() => {
    if (state?.course) {
      setFormData({
        courseName: state.course.courseName,
        creatorName: state.course.creatorName,
        createDate: toISODate(state.course.createDate), // Format date for input
        noOfLectures: state.course.noOfLectures,
        courseLevel: state.course.courseLevel,
        courseCategory: state.course.courseCategory,
        courseDesc: state.course.courseDesc,
        courseThumbnail: null, // Set to null initially to avoid overriding existing thumbnail
      })
    }
  }, [state])

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle file input change for course thumbnail
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        courseThumbnail: file, // Store uploaded file
      }))

      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result) // Display image preview
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const file = formData?.courseThumbnail
    if (file) {
      // Allowed image types
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PNG, JPG are allowed.')
        return
      }

      //allow file size
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        toast.error('File size exceeds 2MB limit.')
        return
      }
    }
    // Use FormData to handle both file and text fields
    const formDataToSend = new FormData()
    formDataToSend.append('courseName', formData.courseName)
    formDataToSend.append('creatorName', formData.creatorName)
    formDataToSend.append('createDate', formData.createDate)
    formDataToSend.append('noOfLectures', formData.noOfLectures)
    formDataToSend.append('courseLevel', formData.courseLevel)
    formDataToSend.append('courseCategory', formData.courseCategory)
    formDataToSend.append('courseDesc', formData.courseDesc)

    // Append courseThumbnail only if it's updated
    if (formData.courseThumbnail) {
      formDataToSend.append('file', formData.courseThumbnail)
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/course/updateCourseById/${state.course.courseId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Required for file upload
          },
        },
      )

      const respData = response.data
      if (respData?.success) {
        toast.success(respData?.message || 'Course updated successfully')
        // navigate('/course-details');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after sometime.')
    }
  }

  return (
    <div className="container p-5 rounded mt-4 shadow" style={{backgroundColor: "White" ,width: "85%"}}>
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
      <div>
        <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '4%',fontSize: "28px"}} className="text-center">Update Course</h4>
        <form>
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Course Name"
                type="text"
                placeholder="Enter Course Name"
                value={formData.courseName}
                onChange={(val) => setFormData({ ...formData, courseName: val })}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Creator Name"
                type="text"
                placeholder="Enter Creator Name"
                value={formData.creatorName}
                onChange={(val) => setFormData({ ...formData, creatorName: val })}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <Date_Picker
                label="Create Date"
                value={ formData.createDate ? new Date(formData.createDate) : null}
                placeholder="Select Create Date"
                onChange={(val) => setFormData({ ...formData, createDate: val })}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Number of Lectures"
                type="number"
                placeholder="Enter Number of Lectures"
                value={formData.noOfLectures}
                onChange={(val) => setFormData({ ...formData, noOfLectures: val })}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
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

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Course Category"
                type="text"
                placeholder="Enter Course Category"
                value={formData.courseCategory}
                onChange={(val) => setFormData({ ...formData, courseCategory: val })}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Course Description"
                type="text"
                placeholder="Enter Course Description"
                value={formData.courseDesc}
                onChange={(val) => setFormData({ ...formData, courseDesc: val })}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 px-4 pb-4">
              <InputField
                label="Course Thumbnail (PNG, JPG UPTO 2MB)"
                type="file"
                name="courseThumbnail"
                value={formData.courseThumbnail}
                onChange={(e) =>
                  setFormData({ ...formData, courseThumbnail: e.target.files[0] })
                }
              />
            </div>

            {role !== 'trainer' && (
              <div className="col-12 mt-4 px-4 pb-4 text-end d-flex justify-content-end">
                <CustomButton
                  title="Update Course"
                  icon="Edit_Pencil_w.svg"
                  onClick={handleSubmit}
                />
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  )
}

export default UpdateCourse

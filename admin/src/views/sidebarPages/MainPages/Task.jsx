import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Form, Button, Col, Row, Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import '../../SidebarCss/Form.css'
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css'

import { BASE_URL } from '../../../BaseURL'
import CustomButton from '../../../components/custom/CustomButton'
import InputField from '../../../components/custom/InputField'
import Date_Picker from '../../../components/custom/Date_Picker'

const Task = () => {
  const [formData, setFormData] = useState({
    taskTitle: '',
    taskDesc: '',
    status: '',
    startDate: '',
    dueDate: '',
    trainerName: '',
    trainerId: '',
  })

  const [trainers, setTrainers] = useState([])
  const navigate = useNavigate()

  // Fetch trainers for dropdown
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/trainer/getTrainerDropdown`)
        const { trainers, success } = response.data
        if (success) {
          setTrainers(trainers)
        } else {
          toast.error('Failed to fetch trainers.')
        }
      } catch (error) {
        toast.error('Error fetching trainers.')
      }
    }
    fetchTrainers()
  }, [])

  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData?.taskTitle) {
      toast.error('Please enter task title.')
      return
    }
    if (!formData?.startDate) {
      toast.error('Please enter start date.')
      return
    }
    if (!formData?.dueDate) {
      toast.error('Please enter due date.')
      return
    }

    if (!formData.trainerId) {
      toast.error('Please select a trainer.', { position: 'top-center' })
      return
    }

    try {
      const response = await axios.post(`${BASE_URL}/task/createTask`, formData)
      const responseData = response.data

      if (responseData?.success) {
        toast.success('Task created successfully!', { position: 'top-center' })
        // Reset form data
        setFormData({
          taskTitle: '',
          taskDesc: '',
          status: '',
          startDate: '',
          dueDate: '',
          trainerName: '',
          trainerId: '',
        })
      } else {
        toast.error('Error creating task. Please try again.')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error.')
    }
  }

  return (
    <>
      <Toaster
  position="top-center"
  reverseOrder={true}
/>
      <div className="container shadow p-4 rounded mt-4" style={{width: "85%", backgroundColor:"white"}}>
  <div>
    <h4 className="text-center mt-4 mb-4 pb-2" style={{fontSize: "28px"}}>Add Task</h4>
    <form>
      <div className="row px-5">
        {/* Task Title */}
        <div className="col-md-6 col-lg-4 px-4 pb-4">
          <InputField
            label="Task Title"
            type="text"
            placeholder="Enter Task Title"
            value={formData.taskTitle}
            onChange={(val) => setFormData({ ...formData, taskTitle: val })}
            required
          />
        </div>

        {/* Task Description */}
        <div className="col-md-6 col-lg-4 px-4 pb-4">
          <InputField
            label="Task Description"
            type="text"
            placeholder="Enter Task Description"
            value={formData.taskDesc}
            onChange={(val) => setFormData({ ...formData, taskDesc: val })}
          />
        </div>

        {/* Start Date */}
        <div className="col-md-6 col-lg-4 px-4 pb-4">
          <Date_Picker
            label="Start Date"
            value={formData.startDate}
            onChange={(val) => setFormData({ ...formData, startDate: val })}
          />
        </div>

        {/* Due Date */}
        <div className="col-md-6 col-lg-4 px-4 pb-4">
          <Date_Picker
            label="Due Date"
            value={formData.dueDate}
            onChange={(val) => setFormData({ ...formData, dueDate: val })}
          />
        </div>

        {/* Trainer */}
        <div className="col-md-6 col-lg-4 px-4 pb-4">
          <InputField
            label="Trainer"
            type="select"
            value={formData.trainerId}
            onChange={(val) => {
              const selectedTrainer = trainers.find((t) => t.trainerId === val)
              setFormData({
                ...formData,
                trainerId: val,
                trainerName: selectedTrainer?.trainerName || '',
              })
            }}
            required
            options={[
              { label: 'Select Trainer', value: '' },
              ...trainers.map((trainer) => ({
                label: `${trainer.trainerName} (${trainer.trainerMobNo})`,
                value: trainer.trainerId,
              })),
            ]}
          />
        </div>

        {/* Status */}
        <div className="col-md-6 col-lg-4 px-4 pb-4">
          <InputField
            label="Status"
            type="select"
            value={formData.status}
            onChange={(val) => setFormData({ ...formData, status: val })}
            required
            options={[
              { label: 'Select Status', value: '' },
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
            ]}
          />
        </div>

        {/* Submit */}
        <div className="col-12 d-flex justify-content-end text-center my-4 px-4">
          <CustomButton
            title="Create Task"
            onClick={handleSubmit}
            icon="tabler_plus.svg"
          />
        </div>
      </div>
    </form>
  </div>
</div>

    </>
  )
}

export default Task

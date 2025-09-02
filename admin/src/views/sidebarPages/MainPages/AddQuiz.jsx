import React, { useState } from 'react'
import { Form, Button, Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import '../../SidebarCss/Form.css'
import axios from 'axios'
import { BASE_URL } from '../../../BaseURL'
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css'

const AddQuiz = () => {
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDesc, setQuizDesc] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(`${BASE_URL}/quiz/addQuiz`, { quizTitle, quizDesc })
      const respData = response.data

      if (respData?.success) {
        toast.success(respData?.message || 'Quiz add successfully')
        setTimeout(() => {
          navigate('/allquiz')
        }, 1000)
      } else {
        toast.error(respData?.message || 'Fail to add quiz')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error.')
    }
  }

  return (
    <Container className="mt-4">
      <Toaster
  position="top-center"
  reverseOrder={true}
/>
      <div className="form-container shadow p-4 rounded">
        <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '20px', fontSize: "28px" }}>Add New Quiz</h4>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-6">
              <Form.Group className="mb-3">
                <Form.Label>Quiz Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter quiz title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group className="mb-3">
                <Form.Label>Quiz Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  placeholder="Enter quiz description"
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          </div>
          <Button size="sm" variant="dark" type="submit">
            Add Quiz
          </Button>
        </Form>
      </div>
    </Container>
  )
}

export default AddQuiz

import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaTrash, FaQuestion } from 'react-icons/fa' // Importing icons for actions
import { BiSolidAddToQueue } from 'react-icons/bi'
import { MdCancel } from 'react-icons/md'

import '../../SidebarCss/Table.css'
import axios from 'axios'
import { BASE_URL } from '../../../BaseURL'
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css'
import Pagination from '../../../components/custom/Pagination'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

const AllQuiz = () => {
  // Static quizzes data
  const [quizzes, setQuizzes] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [editingQuizTitle, setEditingQuizTitle] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 50
  const navigate = useNavigate()

  const handleShowQuestions = (quiz) => {
    setCurrentQuiz(quiz)
    setEditingQuizTitle(quiz.title) // Set the quiz title for editing
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentQuiz(null)
  }

  const handleDeleteQuiz = async (quizId) => {
    const result = await MySwal.fire({
      title: 'Delete Quiz?',
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
    if(result.isConfirmed) {
      try {

        const response = await axios.delete(`${BASE_URL}/quiz/deleteQuizById/${quizId}`)
        const respData = response.data

        if (respData?.success) {
          toast.success(respData?.message || 'Quiz delete successfully')
          getAllQuizList(currentPage)
        } else {
          toast.error(respData?.message || 'Fail to delete quiz')
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
      }
    }
  }

  const handleSaveQuizTitle = () => {
    if (currentQuiz) {
      setCurrentQuiz({ ...currentQuiz, title: editingQuizTitle }) // Update the quiz title
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  //get all quez list for table
  const getAllQuizList = async (currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/quiz/getAllQuizList`, {
        params: { page: currentPage, limit },
      })

      const respData = response.data

      if (respData?.success) {
        setQuizzes(respData?.quizList)
        setTotalPages(respData?.totalPages)
      }
    } catch (error) {
      setQuizzes([])
      setTotalPages(1)
    }
  }

  //icons stylling start
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
    marginLeft: '4px',
  }

  const addSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: '#6860e7',
    padding: '4px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    marginLeft: '4px',
  }
  //icons styllng end

  useEffect(() => {
    getAllQuizList(currentPage)
  }, [currentPage])

  return (
    <>
      <div className="mainTableContainer">
        <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '0', fontSize: "28px" }}>Quiz Details</h4>
        <div className="d-flex justify-content-end align-items-center mb-3">
          <Button variant="dark" size="sm" onClick={() => navigate('/addquiz')}>
            Add Quiz
          </Button>
        </div>

        <table className='table mt-4 table-bordered table-hover align-middle text-center custom-table accessor-table'>
          <thead>
            <tr>
              <th>Sr No</th> {/* Added Serial Number Column */}
              <th className="special-yellow">Quiz Title</th>
              <th className="special-blue">Question Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          {quizzes?.length === 0 ? (
            <div className="">No Quiz available</div>
          ) : (
            <tbody>
              {quizzes?.map((quiz, index) => (
                <tr key={quiz?.quizId}>
                  {/* <td>{index + 1}</td> */}
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td className="special-yellow">
                    <div className="d-flex align-items-center">
                      <span>{quiz?.quizTitle}</span>
                    </div>
                  </td>
                  <td className="special-blue">
                    <span
                      style={{ cursor: 'pointer', color: 'blue' }}
                      onClick={() => handleShowQuestions(quiz)}
                      title="Edit Quize Title"
                    >
                      {quiz.lengthOfQuestionList}
                    </span>
                  </td>
                  <td>
                    <span
                      style={addSpan}
                      title="Add Questions"
                      onClick={() => navigate(`/addquestions`, { state: { id: quiz.quizId } })}
                    >
                      <BiSolidAddToQueue /> {/* Add Questions Icon */}
                    </span>
                    <span style={delSpan} title="Delete Quiz">
                      <MdCancel onClick={() => handleDeleteQuiz(quiz?.quizId)} />
                      {/* Delete quiz button */}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {/* view */}
        {currentQuiz && (
          <Modal show={showModal} onHide={handleCloseModal} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Edit Quiz Title for {currentQuiz.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Edit Quiz Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingQuizTitle}
                    onChange={(e) => setEditingQuizTitle(e.target.value)}
                  />
                </Form.Group>
                <Button size="sm" onClick={handleSaveQuizTitle} className="mb-3">
                  Save Quiz Title
                </Button>
              </Form>

              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {currentQuiz?.questions?.map((question, index) => (
                  <li key={index} style={{ marginBottom: '1.5rem' }}>
                    <div>
                      <strong>
                        {index + 1}. {question.question} ({question.type})
                      </strong>
                    </div>
                    <div>
                      {question?.options?.map((option, idx) => (
                        <div key={idx} className="ms-3">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={option.charAt(0) === question.answer}
                            readOnly
                          />
                          <span
                            className={option.charAt(0) === question.answer ? 'text-success' : ''}
                          >
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Modal.Body>
          </Modal>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Toaster
  position="top-center"
  reverseOrder={true}
/>
    </>
  )
}

export default AllQuiz

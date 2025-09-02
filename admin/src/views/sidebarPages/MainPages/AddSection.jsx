import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Form, Dropdown, ListGroup, Modal } from 'react-bootstrap'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'
import ReactPlayer from 'react-player'
import { useLocation } from 'react-router-dom'
import { BASE_URL } from '../../../BaseURL'
import axios from 'axios'
import '../../SidebarCss/Form.css'
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import parse from 'html-react-parser'

const CreateCurriculum = () => {
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [sections, setSections] = useState([])
  const [quizList, setQuizList] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState('')
  const [sectionTitle, setSectionTitle] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [newLessonType, setNewLessonType] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [articleContent, setArticleContent] = useState('')
  const [quiz, setQuiz] = useState({ question: '', answers: ['', '', '', ''], correctAnswer: 0 })
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentArticle, setCurrentArticle] = useState('')
  const [selectedSection, setSelectedSection] = useState(null) // State to track the selected section

  const [sessionId, setSessionId] = useState('')
  const [lessonId, setLessonId] = useState('')

  // const [sectionId, setSectionId] = useState(null);
  const [isEditing, setIsEditing] = useState(false) // New state for edit mode
  const [isLessonEdit, setIsLessonEdit] = useState(false)

  //get location params
  const location = useLocation()
  const { courseId, courseName } = location.state || {}

  const navigate = useNavigate()

  const handleAddSection = async () => {
    try {
      const reqData = {
        courseId: courseId,
        sessionName: sectionTitle,
      }

      if (isEditing) {
        // Update the existing section
        const response = await axios.put(
          `${BASE_URL}/session/updateSessionById/${sessionId}`,
          reqData,
        )
        const respData = response.data

        if (respData?.success) {
          toast.success(respData?.message || 'Section updated successfully')
          getFullCourseDtlById() // Refresh the sections
          setIsEditing(false) // Reset editing state
          setSectionTitle('')
        } else {
          toast.error(respData?.message || 'Unable to update section. Try again later.')
        }
      } else {
        // Add a new section
        const response = await axios.post(`${BASE_URL}/session/createSession`, reqData)
        const respData = response.data

        if (respData?.success) {
          toast.success(respData?.message || 'Section added successfully')
          setSessionId(respData?.sessionId)
          getFullCourseDtlById() // Refresh the sections
        } else {
          toast.error(respData?.message || 'Unable to add section. Try again later.')
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try again later.')
    }
  }

  const handleAddLesson = async (sectionIndex) => {
    const updatedSections = [...sections]
    const autoLessonTitle = `Lesson ${updatedSections[sectionIndex].lessons.length + 1}: ${lessonTitle || 'Untitled Lesson'}`
    const newLesson = { title: autoLessonTitle, type: newLessonType }

    switch (newLessonType) {
      case 'Video URL':
        newLesson.content = videoUrl
        break
      case 'Article':
        newLesson.content = articleContent
        break
      case 'Quiz':
        newLesson.content = {
          question: quiz.question,
          answers: quiz.answers,
          correctAnswer: quiz.correctAnswer,
        }
        break
      default:
        break
    }

    if (!sessionId) {
      toast.error('Please select section or click on section edit')
      return
    }

    if (!lessonTitle) {
      toast.error('Please enter lesson title')
      return
    }

    try {
      let response
      if (!isLessonEdit) {
        const frmData = new FormData()
        frmData.append('sessionId', sessionId)
        frmData.append('lessonName', lessonTitle)
        frmData.append('type', newLessonType)
        frmData.append('textNote', articleContent)
        frmData.append('videoUrl', videoUrl)
        frmData.append('courseId', courseId)

        if (selectedQuiz) {
          frmData.append('quizId', selectedQuiz)
        }

        response = await axios.post(`${BASE_URL}/lesson/createLesson`, frmData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        let newData = {
          lessonName: lessonTitle,
          lessonType: newLessonType,
          textNote: articleContent,
          videoUrl: videoUrl,
        }

        if (selectedQuiz) {
          newData.quizId = selectedQuiz
        }

        response = await axios.put(`${BASE_URL}/lesson/updateLessonById/${lessonId}`, newData)
      }

      const respData = response.data

      if (respData?.success) {
        toast.success(respData?.message || 'Update successfully')
        getFullCourseDtlById()
        setLessonTitle('')
        setVideoUrl('')
        setArticleContent('')
        setNewLessonType('')
      } else {
        toast.error(respData?.message || 'Unable to update. Try after sometime')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after sometime.')
    }
  }

  const handleDeleteSection = async (sessionId) => {
    try {
      // Send DELETE request to backend
      const response = await axios.delete(`${BASE_URL}/session/deleteSessionById/${sessionId}`)
      const resData = response.data
      if (resData?.success) {
        getFullCourseDtlById()
        // Show success toast
        toast.success('Section deleted successfully!')
      } else {
        // Show error toast
        toast.error('Failed to delete section.')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    try {
      // Send DELETE request to backend
      const response = await axios.delete(`${BASE_URL}/lesson/deleteLessonById/${lessonId}`)
      const resData = response.data
      if (resData?.success) {
        getFullCourseDtlById()
        // Show success toast
        toast.success('Lesson deleted successfully!')
      } else {
        // Show error toast
        toast.error('Failed to delete lesson.')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    }
  }

  const handleEditSection = async (sectionIndex) => {
    const sectionToEdit = sections[sectionIndex]
    setSessionId(sectionToEdit.sessionId) // Assuming sections have an id property
    setSectionTitle(sectionToEdit.sessionName) // Populate the title for editing
    setIsEditing(true)
    // Fetch additional details
    try {
      const response = await fetch(`${BASE_URL}/session/getSessionById/${sectionToEdit.sessionId}`)
      const data = await response.json()

      if (data.success) {
        setSectionTitle(data.sessionDtl.sessionName) // Populate the form with the fetched title
        setIsEditing(true) // Set editing mode to true
      } else {
        toast.error('Session detail not available') // Show toast error
      }
    } catch (error) {
      toast.error('Failed to fetch session details.') // Show toast error
    }
  }

  const handleEditLesson = async (lessonId) => {
    try {
      const response = await axios.get(`${BASE_URL}/lesson/getLessonById/${lessonId}`)
      const respData = response.data

      if (respData?.success) {
        setIsLessonEdit(!isLessonEdit)
        setLessonId(respData?.lessonDtl?.lessonId)
        setLessonTitle(respData?.lessonDtl?.lessonName)
        setNewLessonType(respData?.lessonDtl?.lessonType)
        if (respData?.lessonDtl?.lessonType === 'Article') {
          setArticleContent(respData?.lessonDtl?.textNote)
        } else if (respData?.lessonDtl?.lessonType === 'Video URL') {
          setVideoUrl(respData?.lessonDtl?.videoUrl)
        }
        //add quize here
      } else {
        toast.error('Unable to edit lesson. Try after some time', { position: 'top-center' })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    }
  }

  const handlePlayVideo = (sectionIndex, lessonIndex, videoUrl) => {
    setVideoUrl(videoUrl)
    setShowVideoModal(true)
  }

  const handleShowArticle = (article) => {
    setCurrentArticle(article)
    setShowArticleModal(true)
  }

  const handleShowQuiz = (quiz) => {
    navigate(`/addquestions`, { state: { id: quiz?.quizId } })
  }

  const handleCloseModal = () => {
    setShowVideoModal(false)
    setShowArticleModal(false)
    setShowQuizModal(false)
  }

  const handleSectionClick = (index) => {
    setSelectedSection(selectedSection === index ? null : index) // Toggle section view
  }

  const getFullCourseDtlById = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/course/getFullCourseDtlById/${courseId}`)
      const respData = response.data

      if (respData?.success) {
        setSections(respData?.sessions)
      } else {
        toast.error(respData?.message || 'Not available right now. Try after some time')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    }
  }

  const getQuizList = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/quiz/getQuizDropdown`)
      const respData = response.data

      if (respData?.success) {
        setQuizList(respData?.quizList)
      } else {
        toast.error(respData?.message || 'Not available right now. Try after some time')
      }
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
      }
    }
  }

  useEffect(() => {
    getFullCourseDtlById()
    getQuizList()
  }, [])

  return (
    <Container>
      <Toaster
  position="top-center"
  reverseOrder={true}
/>
      <Row className="addsection">
        <Col md={5}>
          <h4 style={{fontSize: "28px"}}>{courseName}</h4>
          <Form.Group controlId="sectionTitle">
            <Form.Label>Section Title</Form.Label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Control
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Enter Section Title"
                style={{
                  marginRight: '5px',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Add shadow here
                  border: '1px solid #ccc', // Optional: border for cleaner look
                  borderRadius: '4px', // Optional: rounded edges
                  width: '80%',
                }}
              />
            </div>
          </Form.Group>

          {role !== 'trainer' && (
            <Button variant="dark" className="mt-3" onClick={handleAddSection}>
              {isEditing ? 'Save Changes' : 'Add Section'}{' '}
              {/* Change button label based on isEditing */}
            </Button>
          )}

          <hr />

          {/* <h4>Add Lesson</h4> */}
          <Form.Group controlId="lessonTitle">
            <Form.Label>Lesson Title</Form.Label>
            <div className="mt-2">
              <Form.Control
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Enter Lesson Title"
                style={{
                  marginRight: '5px',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Add shadow here
                  border: '1px solid #ccc', // Optional: border for cleaner look
                  borderRadius: '4px', // Optional: rounded edges
                  width: '80%',
                }}
              />

              {role !== 'trainer' && (
                <Dropdown>
                  <Dropdown.Toggle variant="dark" id="dropdown-basic" className="mt-3">
                    {newLessonType || 'Select Lesson Type'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setNewLessonType('Video URL')}>
                      Video URL
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setNewLessonType('Article')}>
                      Article
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setNewLessonType('Quiz')}>Quiz</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}

              {/* {
                (newLessonType === 'Quiz') &&
                <Button
                  variant="dark"
                  className="mt-3"
                >
                  Add One
                </Button>
              } */}
            </div>
          </Form.Group>

          {newLessonType === 'Video URL' && (
            <Form.Group controlId="videoUrl">
              <Form.Label>Video URL</Form.Label>
              <Form.Control
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter Video URL"
              />
            </Form.Group>
          )}

          {newLessonType === 'Article' && (
            <Form.Group controlId="articleContent">
              <Form.Label>Article Content</Form.Label>
              <ReactQuill value={articleContent} onChange={setArticleContent} />
            </Form.Group>
          )}

          {/* quize */}
          {newLessonType === 'Quiz' && (
            <div>
              <Form.Group>
                <Form.Label>Quiz</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedQuiz}
                  onChange={(e) => setSelectedQuiz(e.target.value)}
                >
                  <option value="">Select Quiz</option>
                  {quizList?.map((quiz) => (
                    <option key={quiz?.quizId} value={quiz?.quizId}>
                      {quiz?.quizTitle}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
          )}

          {role !== 'trainer' && (
            <Button
              variant="dark"
              className="mt-3"
              onClick={() => handleAddLesson(sections.length - 1)}
              disabled={!newLessonType}
            >
              {isLessonEdit ? 'Save Changes' : 'Add Lesson'}
            </Button>
          )}
        </Col>

        <Col md={7}>
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              style={{
                backgroundColor: selectedSection === sectionIndex ? '#444' : '#fff', // Active/inactive color
                color: selectedSection === sectionIndex ? '#fff' : '#000',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '4px',
                marginBottom: '15px',
                width: '70%', // Section container width
                marginLeft: 'auto', // Center the section container
                marginRight: 'auto',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'height 0.3s ease', // Smooth transition for expanding section
              }}
            >
              <h6>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSectionClick(sectionIndex)}
                >
                  <span>
                    {selectedSection === sectionIndex ? '-' : '+'}{' '}
                    {'Sec No: ' + (sectionIndex + 1) + ' ' + section.sessionName}
                  </span>

                  <span>
                    {role !== 'trainer' && (
                      <Button
                        variant="light"
                        size="sm"
                        style={{ padding: '2px 5px', fontSize: '12px', marginRight: '10px' }}
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering handleSectionClick
                          handleEditSection(sectionIndex) // Call the edit handler
                        }}
                      >
                        <FaPencilAlt />
                      </Button>
                    )}
                    {role !== 'trainer' && (
                      <Button
                        variant="light"
                        size="sm"
                        style={{ padding: '2px 5px', fontSize: '5px' }}
                        onClick={() => handleDeleteSection(section.sessionId)}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </span>
                </div>
              </h6>

              {selectedSection === sectionIndex && (
                <ListGroup>
                  {section.lessons.map((lesson, lessonIndex) => (
                    <ListGroup.Item
                      key={lessonIndex}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>{'Lesson No: ' + (lessonIndex + 1) + ' ' + lesson?.lessonName}</span>
                        {lesson?.lessonType === 'Video URL' && (
                          <Button
                            variant="light"
                            size="sm"
                            style={{ padding: '2px 5px', fontSize: '8px', marginLeft: '5px' }}
                            onClick={() =>
                              handlePlayVideo(sectionIndex, lessonIndex, lesson?.videoUrl)
                            }
                          >
                            Play
                          </Button>
                        )}
                        {lesson?.lessonType === 'Article' && (
                          <Button
                            variant="light"
                            size="sm"
                            style={{ padding: '2px 5px', fontSize: '8px', marginLeft: '5px' }}
                            onClick={() => handleShowArticle(lesson?.textNote)}
                          >
                            Read Article
                          </Button>
                        )}
                        {lesson?.lessonType === 'Quiz' && (
                          <Button
                            variant="light"
                            size="sm"
                            style={{ padding: '2px 5px', fontSize: '8px', marginLeft: '5px' }}
                            onClick={() => handleShowQuiz(lesson)}
                          >
                            Take Quiz
                          </Button>
                        )}
                      </div>
                      <div>
                        {role !== 'trainer' && (
                          <Button
                            variant="light"
                            size="sm"
                            style={{ padding: '2px 5px', fontSize: '12px', marginLeft: '5px' }}
                            onClick={() => handleEditLesson(lesson?.lessonId)} // Call the edit function
                          >
                            <FaPencilAlt />
                          </Button>
                        )}

                        {role !== 'trainer' && (
                          <Button
                            variant="light"
                            size="sm"
                            style={{ padding: '2px 5px', fontSize: '12px', marginLeft: '5px' }}
                            onClick={() => handleDeleteLesson(lesson?.lessonId)}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          ))}
        </Col>
      </Row>

      {/* Video Modal */}
      <Modal show={showVideoModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Video Player</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReactPlayer url={videoUrl} controls width="100%" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Article Modal */}
      <Modal show={showArticleModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Article</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>{parse(currentArticle)}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Quiz Modal */}
      <Modal show={showQuizModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>{currentQuiz?.question}</h5>
          {currentQuiz?.answers.map((answer, index) => (
            <Form.Check
              key={index}
              type="radio"
              label={answer}
              name="quizOptions"
              id={`answer-${index}`}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default CreateCurriculum

{
  /* <Button
                variant="dark"
                className="mt-3"
                onClick={() => handleAddLesson(sections.length - 1)}
                disabled={!newLessonType}
              >
                Add One
              </Button> */
}

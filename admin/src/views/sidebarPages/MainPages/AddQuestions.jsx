
import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Accordion } from 'react-bootstrap';
import { FaCheckCircle, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { useLocation, useParams } from 'react-router-dom';
import '../../SidebarCss/Form.css';
import toast, { Toaster } from 'react-hot-toast';

import axios from 'axios';
import { BASE_URL } from '../../../BaseURL';
// import '../../SidebarCss/Table.css';
import { MdCancel } from 'react-icons/md'

const AddQuestions = ({ onQuizSubmit, isAuthenticated }) => {
    const location = useLocation();
    // const { id } = useParams();
    const {id} =  location?.state

    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [questionType, setQuestionType] = useState('MCQ');
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [answer, setAnswer] = useState('');
    const [expandedQuestionIndex, setExpandedQuestionIndex] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const questionsContainerRef = useRef(null); // Ref for questions container



    const toggleCorrectAnswer = (index) => {
        if (questionType === 'MCQ') {
            setCorrectAnswers((prev) =>
                prev.includes(index)
                    ? prev.filter((i) => i !== index)
                    : [...prev, index]
            );
        } else {
            setCorrectAnswers([index]);
        }
    };

    const handleAddOrUpdateQuestion = () => {
        if (!currentQuestion) {
            alert('Please enter a question.'); // Alert if the question field is empty
            return;
        }

        if ((questionType === 'MCQ' || questionType === 'SCQ') && options.every(option => option.trim() === '')) {
            alert('Please enter at least one option.'); // Alert if options are empty
            return;
        }

        const newQuestion = {
            type: questionType,
            question: currentQuestion,
            options: questionType === 'MCQ' || questionType === 'SCQ' ? options : [],
            correctAnswers: questionType === 'MCQ' || questionType === 'SCQ' ? correctAnswers : answer,
            answer: questionType === 'True/False' ? answer : null,
        };

        if (isEditing) {
            // Update the existing question
            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = newQuestion;
            setQuestions(updatedQuestions);
            setIsEditing(false);
            setEditingIndex(null);
        } else {
            // Add a new question
            setQuestions([...questions, newQuestion]);
        }

        // Reset form fields
        setCurrentQuestion('');
        setOptions(['', '', '', '']);
        setCorrectAnswers([]);
        setAnswer('');
        setQuestionType('MCQ'); // Reset question type to default
    };

    //add question in quiz
    const addQuestion = async () => {
        try {
            let formData;
            if (questionType === "MCQ") {
                let ans = '';
                if (correctAnswers == 0) {
                    ans = 'A'
                } else if (correctAnswers == 1) {
                    ans = 'B'
                } else if (correctAnswers == 2) {
                    ans = 'C'
                } else if (correctAnswers == 3) {
                    ans = 'D'
                } else {
                    toast.error("Invalid answer");
                    return;
                }

                if (options.length !== 4) {
                    toast.error("Please add four options");
                    return;
                }

                formData = {
                    quizId: id,
                    questionType: questionType,
                    questionTitle: currentQuestion,
                    optionOne: options[0],
                    optionTwo: options[1],
                    optionThree: options[2],
                    optionFour: options[3],
                    answer: ans,
                }
            }
            else if (questionType === "True/False") {
                let ans = '';
                if (answer === "True") {
                    ans = 'A'
                } else if (answer === "False") {
                    ans = 'B'
                } else {
                    toast.error("Invalid answer");
                    return;
                }
                formData = {
                    quizId: id,
                    questionType: questionType,
                    questionTitle: currentQuestion,
                    answer: ans,
                }
            }

            const response = await axios.post(`${BASE_URL}/question/addQuestion`, formData);
            const respData = response.data;

            if (respData?.success) {
                toast.success(respData?.message || "Question add successfully");
                setOptions(['', '', '', '']);
                setCorrectAnswers([]);
                setCurrentQuestion('');
                getQuestionList(id);
            } else {
                toast.error(respData?.message || "Fail to add question");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Internal server error.');
        }
    }

    const handleEditQuestion = (index) => {
        const questionToEdit = questions[index];
        setCurrentQuestion(questionToEdit.question);
        setOptions(questionToEdit.options);
        setCorrectAnswers(questionToEdit.correctAnswers);
        setAnswer(questionToEdit.answer);
        setEditingIndex(index);
        setIsEditing(true);
        setQuestionType(questionToEdit.type);
    };

    const handleDeleteQuestion = async (questionId) => {
        // const updatedQuestions = questions.filter((_, i) => i !== index);
        // setQuestions(updatedQuestions);

        try {
            const response = await axios.delete(`${BASE_URL}/question/deleteQuesById/${questionId}`);
            const respData = response.data;

            if (respData?.success) {
                toast.success(respData?.message || "Question delete successfully");
                getQuestionList(id);
            }else{
                toast.error(respData?.message || "Fail to delete question");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Internal server error.');
        }
    };

    // const handleSubmitQuiz = () => {
    //     if (!isAuthenticated) {
    //         alert('You must be logged in to submit a quiz.'); // Check if user is authenticated
    //         return;
    //     }

    //     if (questions.length === 0) {
    //         alert('Please add at least one question before submitting the quiz.'); // Alert if no questions are added
    //         return;
    //     }

    //     const quizData = {
    //         title: quizTitle,
    //         questions,
    //     };
    //     onQuizSubmit(quizData);
    //     setQuizTitle('');
    //     setQuestions([]);
    // };

    //fetch questionlist
    const getQuestionList = async (quizId) => {
        try {
            const response = await axios.get(`${BASE_URL}/question/getQuesListById/${quizId}`);
            const respData = response.data;

            if (respData?.success) {
                setQuestions(respData?.questionList);
            } else {
                toast.error(respData?.message || "No question available");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Internal server error.');
        }
    }

    useEffect(() => {
        if (questions.length === 4) {
            questionsContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [questions]);

    useEffect(() => {
        getQuestionList(id);
    }, []);

    const renderQuestionForm = () => {
        if (questionType === 'MCQ' || questionType === 'SCQ') {
            return (
                <>
                    <Form.Group className="mb-3">
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            type="text"
                            value={currentQuestion}
                            onChange={(e) => setCurrentQuestion(e.target.value)}
                        />
                    </Form.Group>

                    <Row>
                        {options.map((option, index) => (
                            <Col key={index} xs={6}>
                                <Form.Group className="mb-2 d-flex align-items-center">
                                    <Form.Control
                                        type="text"
                                        value={option}
                                        placeholder={`Option ${index + 1}`}
                                        onChange={(e) => {
                                            const newOptions = [...options];
                                            newOptions[index] = e.target.value;
                                            setOptions(newOptions);
                                        }}
                                    />
                                    <FaCheckCircle
                                        className={`ms-2 ${correctAnswers.includes(index) ? 'text-success' : 'text-muted'}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => toggleCorrectAnswer(index)}
                                    />
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>
                </>
            );
        } else if (questionType === 'True/False') {
            return (
                <>
                    <Form.Group className="mb-3">
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            type="text"
                            value={currentQuestion}
                            onChange={(e) => setCurrentQuestion(e.target.value)}
                        />
                    </Form.Group>

                    <Row>
                        <Col xs={6} className="d-flex align-items-center">
                            <Form.Check
                                type="radio"
                                label="True"
                                name="trueFalse"
                                checked={answer === 'True'}
                                onChange={() => setAnswer('True')}
                            />
                            <FaCheckCircle
                                className={`ms-2 ${answer === 'True' ? 'text-success' : 'text-muted'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setAnswer('True')}
                            />
                        </Col>
                        <Col xs={6} className="d-flex align-items-center">
                            <Form.Check
                                type="radio"
                                label="False"
                                name="trueFalse"
                                checked={answer === 'False'}
                                onChange={() => setAnswer('False')}
                            />
                            <FaCheckCircle
                                className={`ms-2 ${answer === 'False' ? 'text-success' : 'text-muted'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setAnswer('False')}
                            />
                        </Col>
                    </Row>
                </>
            );
        }
    };

    const handleAccordionToggle = (index) => {
        setExpandedQuestionIndex(expandedQuestionIndex === index ? null : index);
    };

    return (
        <Container fluid className="mt-4">
            <Toaster
  position="top-center"
  reverseOrder={true}
/>
            <div className="form-container shadow p-4 rounded" style={{ height: "70vh" }}>
                <h4 className="text-center mb-4" style={{fontSize: "28px"}}>Add Questions</h4>
                <Form>
                    <Row>
                        <Col xs={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Question Type</Form.Label>
                                <Form.Select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                                    <option value="MCQ">Multiple Choice Question (MCQ)</option>
                                    {/* <option value="SCQ">Single Choice Question (SCQ)</option> */}
                                    <option value="True/False">True/False</option>
                                </Form.Select>
                            </Form.Group>
                            {renderQuestionForm()}
                        </Col>
                        <Col xs={6} ref={questionsContainerRef} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <h5>Questions</h5>
                            <Accordion defaultActiveKey="0">
                                {questions.map((q, index) => (
                                    <Accordion.Item
                                        eventKey={index}
                                        key={q?.questionId}
                                        className="accordion-item"
                                        style={{
                                            maxWidth: '800px',
                                            margin: 'auto',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            marginBottom: '15px',
                                        }}
                                    >
                                        <Accordion.Header
                                            onClick={() => handleAccordionToggle(index)}
                                            style={{
                                                fontSize: '16px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div style={{ flexGrow: 1 }}>
                                                {`${index + 1}. ${q.questionTitle} (${q.questionType})`}
                                            </div>
                                            <div className="d-flex align-items-center" style={{ marginLeft: 'auto' }}>
                                                <FaPencilAlt
                                                    className="me-2"
                                                    onClick={(e) => { e.stopPropagation(); handleEditQuestion(index); }}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <FaTrash
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q?.questionId); }}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body style={{ padding: '0.5rem 1rem', height: 'auto' }}>
                                            {q.questionType === 'MCQ' || q.questionType === 'SCQ' ? (
                                                <Row>
                                                    <Col className="col-6">
                                                        {String.fromCharCode(65 + 0)}. {q?.optionOne}{' '}
                                                        {q.answer === "A" && <span>(Correct)</span>}
                                                        <br />
                                                        {String.fromCharCode(65 + 1)}. {q?.optionTwo}{' '}
                                                        {q.answer === "B" && <span>(Correct)</span>}
                                                    </Col>
                                                    <Col className="col-6">
                                                        {String.fromCharCode(65 + 2)}. {q?.optionThree}{' '}
                                                        {q.answer === "C" && <span>(Correct)</span>}
                                                        <br />
                                                        {String.fromCharCode(65 + 3)}. {q?.optionFour}{' '}
                                                        {q.answer === "D" && <span>(Correct)</span>}
                                                    </Col>
                                                </Row>
                                            ) : (
                                                <p>{q.answer === "A" ? "True" : "False"}</p>
                                            )}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Col>

                    </Row>
                    <div className='d-flex justify-content-between mt-4'>
                        <Button size="sm" variant="dark" onClick={addQuestion} className="mt-2">
                            {isEditing ? 'Update Question' : 'Add Question'}
                        </Button>
                        {/* <Button size="sm" style={{ color: "white" }} variant="success" onClick={handleSubmitQuiz} className="mt-2">
                            Submit Questions
                        </Button> */}
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default AddQuestions;

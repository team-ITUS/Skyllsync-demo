import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap'
import { FaEye } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import CustomButton from "../../../components/custom/CustomButton"
import axios from 'axios'
import '../../SidebarCss/Table.css'
import { BASE_URL } from '../../../BaseURL'
import toast, { Toaster } from 'react-hot-toast';
import Date_Picker from '../../../components/custom/Date_Picker'
import InputField from '../../../components/custom/InputField'
import ActionMenu from '../../../components/custom/ActionMenu'
import Pagination from '../../../components/custom/Pagination'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';
import { useNavigate } from 'react-router-dom'

const MySwal = withReactContent(Swal)


const AllTask = () => {
  const [tasks, setTasks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 50 // Adjust limit as per your requirement
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null) // To store selected task for editing
  const [formData, setFormData] = useState({
    taskTitle: '',
    taskDesc: '',
    status: '',
    startDate: '',
    dueDate: '',
    trainerName: '',
  })

  const [isEdit, setIsEdit] = useState(false)
  const [trainers, setTrainers] = useState([])
  const [selectedTrainerId, setSelectedTrainerId] = useState('')

  const [searchName, setSearchName] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchTasks = async (currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/task/getAllTaskList`, {
        params: {
          page: currentPage,
          limit,
          status: statusFilter !== 'all' ? statusFilter : '',
          fromDate: dateFrom,
          toDate: dateTo,
          search: searchName,
        },
      })
      const respData = response.data

      if (respData?.success) {
        setTasks(respData?.taskList)
        setTotalPages(respData?.totalPages)
      }
    } catch (error) {
      setTasks([])
      setTotalPages(1)
    }
  }

  const handleEdit = async (taskId) => {
    try {
      const response = await axios.get(`${BASE_URL}/task/getTaskById/${taskId}`)
      const { task: taskData } = response.data
      setSelectedTask(taskData)
      setFormData({
        taskId: taskData?.taskId,
        taskTitle: taskData?.taskTitle,
        taskDesc: taskData?.taskDesc,
        status: taskData?.status,
        startDate: taskData?.startDate,
        dueDate: taskData?.dueDate,
        trainerName: taskData?.trainerName,
      })
      fetchTrainers()
      setShowModal(true)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch task details.')
    }
  }

  const handleDelete = async (taskId) => {
    const result = await MySwal.fire({
      title: 'Delete This Task?',
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

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${BASE_URL}/task/deleteTaskById/${taskId}`)
        const respData = response.data

        if (respData?.success) {
          toast.success(respData?.message || 'Task deleted successfully', { position: 'top-center' })
          fetchTasks(currentPage)
        } else {
          toast.error(respData?.message || 'Fail to delete task')
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Internal server error. Try again later.')
      }
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchTasks(page)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedTask(null)
  }

  //toggle edit to save change
  const toggleEdit = () => {
    setIsEdit(!isEdit)
  }

  //update task
  const handleUpdate = async (taskId) => {
    try {
      const updateData = {
        taskTitle: formData.taskTitle,
        taskDesc: formData?.taskDesc,
        status: formData?.status,
        startDate: formData?.startDate,
        dueDate: formData.dueDate,
        trainerId: selectedTrainerId,
        trainerName: trainers.find((trainer) => trainer.trainerId === selectedTrainerId)
          ?.trainerName,
      }

      const response = await axios.put(`${BASE_URL}/task/updateTaskById/${taskId}`, updateData)
      const respData = await response.data

      if (respData?.success) {
        toast.success(respData?.message || 'Task update successfully')
        fetchTasks(currentPage)
      } else {
        toast.error(respData?.message || 'Fail to update task')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try again later.')
    } finally {
      setIsEdit(!isEdit)
      setShowModal(false)
    }
  }

  //fetch trainer for dropdown
  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/trainer/getTrainerList`)
      const { trainers } = response.data

      setTrainers(trainers || []) // Ensure trainers is an array
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch trainers.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const options = { day: '2-digit', year: 'numeric', month: '2-digit' }
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', options).split('/').reverse().join('-') // Convert to dd-mm-yyyy format
  }
  const DateFormat = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${day}-${month}-${year}`
  }
  // Handle input change in modal form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const statusColor = (status) => {
    if (status === 'completed') {
      return '#28A763'
    } else if (status === 'pending') {
      return '#FFA500'
    } else {
      return 'blue'
    }
  }

  //icon stylling start

  const editSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: '#497AE5',
    padding: '4px',
    borderRadius: '4px',
    color: 'white',
    marginRight: '4px',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  //delete icon
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
  };

  //icon stylling end

  useEffect(() => {
    fetchTasks(currentPage)
  }, [statusFilter, dateFrom, dateTo, searchName])

  const navigate = useNavigate();

  return (
    <div className="mainTableContainer">
      <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>All Tasks</h4>

      <div className="table-container">
        <div className="row mb-2 d-flex align-items-center">
          <div className="col-lg-3">
            <div style={{ width: "90%" }}>

              <InputField
                label="Search by title"
                type="text"
                placeholder="Search by title"
                value={searchName}
                onChange={(val) => setSearchName(val)}
              />
            </div>
          </div>

          <div className="col-lg-2 d-flex justify-content-center">
            <div style={{ width: "80%" }}>

              <InputField
                label="Status"
                type="select"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Completed', value: 'completed' },
                ]}
              />
            </div>
          </div>

          <div className="col-lg-2 d-flex justify-content-center">
            <div style={{ width: "80%" }}>

              <Date_Picker
                label="Start Date"
                value={dateFrom}
                onChange={(val) => setDateFrom(val)}
              />
            </div>
          </div>

          <div className="col-lg-2 d-flex justify-content-center">
            <div style={{ width: "80%" }}>

              <Date_Picker
                label="Due Date"
                value={dateTo}
                onChange={(val) => setDateTo(val)}
              />
            </div>
          </div>

          <div className="col-lg-3">
            <div className='d-flex justify-content-end mt-4'>
                <CustomButton title="Add Task" icon="tabler_plus.svg" onClick={()=> navigate("/add-task")} />
            </div>
          </div>
        </div>

        <div className="table-container outer-table mt-4">
          <table className="table table-bordered table-hover align-middle text-center custom-table accessor-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th className="special-yellow">Task Title</th>
                {/* <th>Task Description</th> */}
                <th className="special-blue">Trainer Name</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            {tasks?.length === 0 ? (
              <div>No task available</div>
            ) : (
              <tbody>
                {tasks?.map((task, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * limit + index + 1}</td>
                    <td className="special-yellow">{task?.taskTitle}</td>
                    {/* <td style={{ maxWidth: '200px', overflowY: 'auto', whiteSpace: 'nowrap' }}>
                    <div style={{ maxHeight: '50px', overflowY: 'auto' }}>{task?.taskDesc}</div>
                  </td> */}
                    <td className="special-blue">{task?.trainerName}</td>
                    <td
                      style={{ fontWeight: '500', color: statusColor(task.status) }}
                    >
                      {task.status.toUpperCase()}
                    </td>
                    <td>{DateFormat(task?.startDate)}</td>
                    <td>{DateFormat(task?.dueDate)}</td>
                    <td className='position-relative'>
                      <ActionMenu
                        options={[
                          {
                            icon: 'Edit_Pencil_b.svg',
                            title: 'View Task',
                            onClick: () => handleEdit(task?.taskId),
                          },
                          {
                            icon: 'material-symbols_delete-outline.svg',
                            title: 'Delete Task',
                            onClick: () => handleDelete(task?.taskId),
                          },
                        ]}
                      />

                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Task Edit Modal */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group controlId="taskTitle">
                  <Form.Label>Task Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="taskTitle"
                    value={formData?.taskTitle}
                    onChange={handleChange}
                    readOnly={!isEdit}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="taskDesc">
                  <Form.Label>Task Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="taskDesc"
                    value={formData?.taskDesc}
                    onChange={handleChange}
                    readOnly={!isEdit}
                    rows={1}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="startDate">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formatDate(formData?.startDate)}
                    onChange={handleChange}
                    readOnly={!isEdit}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="dueDate">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={formatDate(formData?.dueDate)}
                    onChange={handleChange}
                    readOnly={!isEdit}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trainer</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedTrainerId}
                    onChange={(e) => setSelectedTrainerId(e.target.value)}
                    disabled={!isEdit}
                  >
                    <option value="">{formData?.trainerName}</option>
                    {trainers?.map((trainer) => (
                      <option key={trainer.trainerId} value={trainer.trainerId}>
                        {trainer.trainerName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    as="select"
                    name="status"
                    value={formData?.status}
                    onChange={handleChange}
                    disabled={!isEdit}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
          </Form>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }} className=" mt-3">
            {' '}
            {/* Use ml-auto for right alignment */}
            <Button
              variant="dark"
              size="sm"
              onClick={() => {
                isEdit ? handleUpdate(formData?.taskId) : toggleEdit()
              }}
            >
              {isEdit ? 'Save Changes' : 'Edit'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  )
}

export default AllTask

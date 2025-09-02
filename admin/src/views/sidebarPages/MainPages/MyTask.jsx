import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap'
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import axios from 'axios'
import '../../SidebarCss/Table.css'
import { BASE_URL } from '../../../BaseURL'
import toast, { Toaster } from 'react-hot-toast';
import Pagination from '../../../components/custom/Pagination'


const MyTask = () => {
  const [tasks, setTasks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 50

  const [statusFilter, setStatusFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [dueDateFilter, setDueDateFilter] = useState('')

  const getMyTask = async () => {
    const trainerId = localStorage.getItem('uuid')
    try {
      const response = await axios.get(`${BASE_URL}/task/getTrainerTask/${trainerId}`, {
        params: {
          page: currentPage,
          limit,
          status: statusFilter.toLowerCase(),
          startDate: startDateFilter,
          dueDate: dueDateFilter || undefined,
        },
      })
      const respData = response.data

      if (respData?.success) {
        const { trainerTask, totalPages } = response.data
        setTasks(trainerTask)
        setTotalPages(totalPages)
      } else {
        toast.error(respData?.message || 'Task not available')
        setTasks([])
      }
    } catch (error) {
      setTotalPages(1)
      setTasks([])
    }
  }

  //onchange for status
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
  }

  //onchange for start date
  const handleStartDateFilterChange = (e) => {
    setStartDateFilter(e.target.value)
  }

  //onchange for due date
  const handleDueDateFilterChange = (e) => {
    setDueDateFilter(e.target.value)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const DateFormat = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${day}-${month}-${year}`
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

  useEffect(() => {
    getMyTask()
  }, [currentPage, statusFilter, startDateFilter, dueDateFilter])

  return (
    <div className="mainTableContainer">
      <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>My Tasks</h4>

      <div className="table-container">
        <Row style={{ marginBottom: '15px' }}>
          <Col md={3}>
            <Form.Group controlId="statusFilter">
              <Form.Label className="searchbar">Task Status</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                style={{ fontSize: '14px', padding: '3px' }}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3} style={{ textAlign: 'left' }}>
            <Form.Group controlId="dateFrom">
              <Form.Label className="searchbar">Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDateFilter}
                onChange={handleStartDateFilterChange}
                style={{ fontSize: '14px', padding: '3px' }}
              />
            </Form.Group>
          </Col>

          <Col md={3} style={{ textAlign: 'left' }}>
            <Form.Group controlId="dateTo">
              <Form.Label className="searchbar">Due Date</Form.Label>
              <Form.Control
                type="date"
                value={dueDateFilter}
                onChange={handleDueDateFilterChange}
                style={{ fontSize: '14px', padding: '3px' }}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="table-responsive mt-4">
          <table className="table table-bordered table-hover align-middle text-center custom-table accessor-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th className="special-yellow">Task Title</th>
              <th className="special-blue">Task Description</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          {tasks?.length === 0 ? (
            <div className="">No tasks available</div>
          ) : (
            <tbody>
              {tasks?.map((task, index) => (
                <tr key={index}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td className="special-yellow">{task?.taskTitle}</td>
                  <td className="special-blue">{task?.taskDesc}</td>
                  <td style={{ fontWeight: '500', color: statusColor(task.status) }}>
                    {task.status.toUpperCase()}
                  </td>
                  <td>{DateFormat(task?.startDate)}</td>
                  <td>{DateFormat(task?.dueDate)}</td>
                  <td>
                    <span
                      className="viewSpan"
                      style={{
                        background:
                          task.status.toLowerCase() === 'Completed'.toLocaleLowerCase()
                            ? 'red'
                            : 'green',
                      }}
                    >
                      {task.status.toLowerCase() === 'Completed'.toLocaleLowerCase()
                        ? 'Pending'
                        : 'Complet'}
                    </span>
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

      <Toaster
  position="top-center"
  reverseOrder={true}
/>
    </div>
  )
}

export default MyTask

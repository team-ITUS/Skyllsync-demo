import React, { useEffect, useState, useRef } from 'react'
import { Table, Form, Row, Col, Spinner, Button, Modal, ListGroup } from 'react-bootstrap'
import * as XLSX from 'xlsx'
import { MdCancel } from 'react-icons/md'
import { useLocation, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { BASE_URL } from '../../../BaseURL'
import { FaFilePdf } from 'react-icons/fa'
import '../../SidebarCss/Table.css'
import { CgSoftwareUpload } from 'react-icons/cg'
import CustomButton from '../../../components/custom/CustomButton';
import InputField from '../../../components/custom/InputField';
import ActionMenu from '../../../components/custom/ActionMenu';
import Pagination from '../../../components/custom/Pagination';
import { formatISOToDDMMYYYY } from '../../../utils/dataHelpers'

const BatchMembers = () => {
  const [role, setRole] = useState(localStorage.getItem('role'))

  //navigate
  const navigate = useNavigate()
  //location
  const location = useLocation()
  const [studIdsList, setStudIdsList] = useState(location?.state?.studIdsList)
  const [batchId, setBatchId] = useState(location?.state?.batchId)
  const [batchName, setBatchName] = useState('')
  const [linkCreatedAt, setLinkCreatedAt] = useState('')

  const [searchName, setSearchName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 50

  const [students, setStudents] = useState([])
  const [isDownloading, setIsDownloading] = useState('')
  const [issuingStudent, setIssuingStudent] = useState('')

  //modal state
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStudents, setFilteredStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [showModal, setShowModal] = useState(false)

  const fileInputRefs = useRef({});

  const triggerFileInput = (studentId) => {
    if (fileInputRefs.current[studentId]) {
      fileInputRefs.current[studentId].click()
    }
  }

  const onFileChange = (studentId, e) => {
    const file = e.target.files[0]
    handleReuploadPhoto(studentId, file)
  }


  const getBatchNameById = async (batchId) => {
    try {
      const response = await axios.get(`${BASE_URL}/batch/getBatchNameById/${batchId}`);
      return response.data?.batchName || 'Unknown Batch';
    } catch (error) {
      console.error('Error fetching batch name:', error);
      return 'Unknown Batch';
    }
  };

  const getLinkCreateDateById = async (batchId) => {
    try {
      const response = await axios.get(`${BASE_URL}/batch/getLinkCreateDateById/${batchId}`);
      return response.data?.createdAt || 'Unknown Date';
    } catch (error) {
      console.error('Error fetching link creation date:', error);
      return 'Unknown Date';
    }
  };

  // const downloadSinglePhoto = async (studentId) => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}/batch/downloadSinglePhoto/${studentId}`, {
  //       responseType: 'blob', // Important
  //     });

  //     // Create a URL for the downloaded file
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.setAttribute('download', `student_${studentId}_photo.jpg`); // Specify the file name
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   } catch (error) {
  //     console.error('Error downloading photo:', error);
  //     toast.error('Failed to download photo.');
  //   }
  // };
  const downloadSinglePhoto = async (studentId) => {
  try {
    setIsDownloading(studentId); // show loading on that student

    const response = await axios.get(
      `${BASE_URL}/batch/downloadSinglePhoto/${studentId}`,
      { responseType: 'blob' }
    );

    // try to extract filename from header
    const disposition = response.headers['content-disposition'] || '';
    let filename = `student_${studentId}_photo`;
    const fileNameMatch = disposition.match(/filename\\*=UTF-8''(.+)|filename="(.+)"|filename=(.+)/i);
    if (fileNameMatch) {
      filename = decodeURIComponent(fileNameMatch[1] || fileNameMatch[2] || fileNameMatch[3]);
    } else {
      // fallback extension detection
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('jpeg')) filename += '.jpg';
      else if (contentType.includes('png')) filename += '.png';
      else filename += '.jpg';
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading photo:', error);
    toast.error('Failed to download photo.');
  } finally {
    setIsDownloading(''); // stop loading
  }
};

  const handleExportAll = async () => {
    try {
      // 1️⃣ Fetch ALL students (override pagination by requesting a very large limit)
      let allStudents = [];
      try{
        const response = await axios.get(`${BASE_URL}/issuedCert/getExportableData/${batchId}`)
        allStudents = response.data?.exportableData || [];
      }catch{
        const response = await axios.post(
          `${BASE_URL}/student/getStudentsByIds`,
          { studIdsList, page: 1, limit: 10000, search: '' }
        );
        allStudents = response.data?.students || [];
      }
      
      console.log(allStudents)
      if (!allStudents.length) {
        toast.error('No students to export.');
        return;
      }

      // 2️⃣ Map to a plain array of objects for XLSX
      const sheetData = allStudents.map((s, idx) => 
      {
        return ({
          'Sr No': idx + 1,
          'Certificate ID': s?.certificateId || 'N/A',
          Name: s?.name || 'N/A',
          Email: s.email || 'N/A',
          'Mobile': s.mobile || 'N/A',
          'Dob': formatISOToDDMMYYYY(s.dob) || 'N/A',
          'Gender': s.gender || 'N/A',
          'Occupation': s.occupation || 'N/A',
          'Qualification': s.qualification || 'N/A',
          'Address': s.address || 'N/A',
          'BloodGrp': s.bloodGrp || 'N/A',
          // Status: s.isProfile,
        }
      )
      }  
      );
      console.log(sheetData);
      // 3️⃣ Build workbook & worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, 'BatchMembers');

      // 4️⃣ Trigger client download
      XLSX.writeFile(wb, `Batch_${batchId}_Members.xlsx`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export students.');
    }
  };


  //get batch members
  const getBatchMembers = async (page) => {
    try {
      const response = await axios.post(`${BASE_URL}/student/getStudentsByIds`, {
        studIdsList: studIdsList,
        page,
        limit,
        search: searchName,
      })
      const respData = response?.data

      if (respData?.success) {
        setStudents(respData?.students)
        setTotalPages(respData?.totalPages)
      }
    } catch (error) {
      setStudents([])
      setTotalPages(1)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    getBatchMembers(page)
  }

  //remove student from that batch
  const removeStudent = async (studentId, batchId) => {
    const result = await MySwal.fire({
      title: 'Remove Student?',
      text: 'This action cannot be undone. Do you really want to remove this student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#374174', // Navy blue
      cancelButtonColor: '#EBA135',  // Yellow
      background: '#fefefe',
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      }
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${BASE_URL}/batch/removeStudent`, {
          data: { studentId, batchId },
        })
        const respData = response.data

        if (respData?.success) {

          toast.success(respData?.message || 'Removed student successfully')
          setTimeout(() => {
            navigate('/all-batch');
          }, 1000)
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
      }
    }
  }

  // Issue single certificate for a student (admin)
  const handleIssueSingle = async (studentId) => {
    try {
      setIssuingStudent(studentId);
      const response = await axios.post(`${BASE_URL}/issuedCert/issueSingleCertificate/${batchId}/${studentId}`, {});
      const respData = response.data;
      if (respData?.success) {
        toast.success(respData.message || 'Student issued successfully');
        // refresh members list
        getBatchMembers(currentPage);
      } else {
        toast.error(respData?.message || 'Failed to issue certificate');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Server error while issuing certificate');
    } finally {
      setIssuingStudent('');
    }
  }


  //search student for add in batch
  const handleSearchChange = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === '') {
      setFilteredStudents([])
      return
    }

    try {
      const response = await axios.get(`${BASE_URL}/student/searchStudent`, {
        params: { query: value },
      })

      if (response.data.success) {
        setFilteredStudents(response.data.data)
      } else {
        setFilteredStudents([])
      }
    } catch (error) {
      setFilteredStudents([])
    }
  }

  // Handle selecting a student
  const handleSelectStudent = (student) => {
    if (!selectedStudents.find((s) => s.studentId === student.studentId)) {
      setSelectedStudents([...selectedStudents, student])
    }
    // setSearchTerm('') // Reset search
    // setFilteredStudents([]) // Hide dropdown
  }

  //check batch is completed or not by trainer
  const checkTCompeted = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/batch/checkTComplete/${batchId}`)
      const respData = response.data

      if (respData?.success) {
        return true
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after sometime.')
      return false
    }
  }

  //open model
  const openModel = async () => {
    const isCompleted = await checkTCompeted()

    if (isCompleted) {
      setShowModal(true)
    } else {
      return
    }
  }

  //add new student in batch
  const addNewStud = async () => {
    try {
      if (selectedStudents?.length === 0) {
        toast.error('Please select student.')
        return
      }
      const studentIds = selectedStudents?.map((stud) => stud?.studentId)

      const reqData = {
        studentIds,
        batchId,
      }

      const response = await axios.put(`${BASE_URL}/batch/addNewStud`, reqData)
      const respData = response.data

      if (respData?.success) {
        toast.success(respData?.message || 'Student added successfully.')
        setShowModal(false)
        setSelectedStudents([])
        setTimeout(() => {
          navigate('/all-batch');
        }, 1000);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Try after sometime.')
    }
  }

  //reupload photo
  const handleReuploadPhoto = async (studentId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('imagePath', file);

    try {
      const response = await axios.put(
        `${BASE_URL}/student/reupload-profile-photo/${studentId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (response.data.success) {
        toast.success('Photo re-uploaded! Awaiting admin approval.');
        getBatchMembers(currentPage)
      } else {
        toast.error(response.data.message || 'Failed to re-upload photo.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error.');
    }
  };

  useEffect(() => {
    getBatchMembers(currentPage);
  }, [searchName])

  useEffect(() => {
    const fetchBatchName = async () => {
      const batchName = await getBatchNameById(batchId);
      setBatchName(batchName);
    };

    fetchBatchName();
  }, [batchId]);

  useEffect(() => {
    const fetchLinkCreateDate = async () => {
      const linkCreatedAt = await getLinkCreateDateById(batchId);
      setLinkCreatedAt(linkCreatedAt);
    };

    fetchLinkCreateDate();
  }, [batchId]);

  

  return (
    <div className="mainTableContainer">
      <div className="row">
        <div className="col-4"><h4>{batchName}</h4></div>
        <div className="col-4"><h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>Batch Members</h4></div>
        <div className="col-4">{linkCreatedAt}</div>
      </div>

      <div className="row mb-2 align-items-center justify-content-between">
        <div className="col-md-3">
          <label className="searchbar">Search by</label>
          <InputField
            type="text"
            placeholder="Search by name, email, mobile"
            value={searchName}
            onChange={(val) => setSearchName(val)}
          />
        </div>

        {role === 'admin' && (
          <div className="col-auto d-flex gap-2">
            <CustomButton
              title="Export Students"
              icon="File_Download_b.svg"
              variant="outline"
              onClick={handleExportAll}
            />
            <CustomButton
              title="Add Student"
              icon="tabler_plus.svg"
              onClick={openModel}
            />
          </div>

        )}
      </div>


      <div className="table-container mt-4">
        <table className='table table-bordered table-hover align-middle text-center custom-table accessor-table'>
          <thead>
            <tr>
              <th>Sr No</th>
              <th className="special-yellow">Student Name</th>
              <th className="special-blue">Email</th>
              <th>Mobile No</th>
              <th>Action</th>
            </tr>
          </thead>
          {students?.length === 0 ? (
            <div className="">No student available</div>
          ) : (
            <tbody>
              {students?.map((stud, index) => (
                <>
                  <tr
                    key={index}
                    style={stud.isProfile == "Rejected" ? { backgroundColor: '#ffeaea' } : {}}
                  >
                    <td style={stud.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{(currentPage - 1) * limit + index + 1}</td>
                    <td className="special-yellow">{stud.name}</td>
                    <td className="special-blue">{stud.email}</td>
                    <td style={stud.isProfile == "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{stud.mobile}</td>
                    <td className='position-relative' style={stud.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>
                      <ActionMenu
                        options={[
                          // {
                          //   icon: 'pdf-icon.svg', // Replace with your actual PDF icon path
                          //   title: 'Download Certificate',
                          //   onClick: () => dwnCertificate(stud.studentId, batchId, stud.name?.replace(/\s/g, '')),
                          //   isLoading: isDownloading === stud.studentId,
                          // },
                          // Issue certificate (admin only)
                          role === 'admin' && {
                            icon: 'certificate_b.svg',
                            title: 'Issue',
                            onClick: () => handleIssueSingle(stud.studentId),
                            isLoading: issuingStudent === stud.studentId,
                          },
                          {
                            icon: 'Download_b.svg', // pick your icon file
                            title: 'Download Photo',
                            onClick: () => downloadSinglePhoto(stud.studentId),
                            isLoading: isDownloading === stud.studentId,
                          },
                          ...(role === 'admin'
                            ? [
                              {
                                icon: 'material-symbols_delete-outline.svg',
                                title: 'Remove Student',
                                onClick: () => removeStudent(stud.studentId, batchId),
                              },
                            ]
                            : []),
                          ...(stud.isProfile !== 'Completed'
                            ? [
                              {
                                icon: 'Import_b.svg',
                                title: 'Re-upload Photo',
                                onClick: () => triggerFileInput(stud.studentId),
                                customRender: (
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    ref={(el) => (fileInputRefs.current[stud.studentId] = el)}
                                    onChange={(e) => onFileChange(stud.studentId, e)}
                                  />
                                ),
                              },
                            ]
                            : []),
                        ]}
                      />

                    </td>
                  </tr>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={(el) => (fileInputRefs.current[stud.studentId] = el)}
                    onChange={(e) => onFileChange(stud.studentId, e)}
                  />
                </>

              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* add new student modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Students</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Searchable Dropdown */}
          <Form.Group controlId="searchStudent">
            <Form.Label>Search Student</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter student name"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {filteredStudents.length > 0 && (
              <ListGroup className="mt-2">
                {filteredStudents.map((student) => (
                  <ListGroup.Item
                    key={student.id}
                    action
                    onClick={() => handleSelectStudent(student)}
                  >
                    <span>{student.name}</span> <span>{student.mobile}</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>

          {/* Selected Students Table */}
          {selectedStudents.length > 0 && (
            <div className="table-responsive mt-4 rounded-table-wrapper">


              <table className='table table-bordered table-hover align-middle text-center custom-table accessor-table'>
                <thead>
                  <tr>
                    <th>Sr.No:</th>
                    <th className="special-yellow">Student Name</th>
                    <th className="special-blue">Mobile</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td className="special-yellow">{student.name}</td>
                      <td className="special-blue">{student.mobile}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setSelectedStudents(selectedStudents.filter((s) => s.id !== student.id))
                          }
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={() => addNewStud()}>
            Add Student
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  )
}

export default BatchMembers

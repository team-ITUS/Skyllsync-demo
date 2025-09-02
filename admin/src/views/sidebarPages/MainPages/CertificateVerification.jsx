// CertificateVerification.jsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL } from '../../../BaseURL'
import { Container } from 'react-bootstrap'
import Verify_custom from '../../../components/custom/Verify_custom'
import toast, { Toaster } from 'react-hot-toast'

const CertificateVerification = () => {
  const { batchId, studentId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [certificate, setCertificate] = useState({
    studentName: '',
    courseName: '',
    issuedOn: '',
    validTill: '',
    certCode: '',
    status: 'Verified',
    studentImg: '',
  })

  const fetchCertificate = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/certificate/verify/${batchId}/${studentId}`)
      const respData = response.data
      console.log('Response data:', respData)
      if (respData?.success) {
        const updated = { ...respData.data, status: 'Verified' }
        // If studentImg is not a full URL, prefix it
        if (updated.studentImg && !updated.studentImg.startsWith("http")) {
          updated.studentImg = `${BASE_URL}/${updated.studentImg}`
        }
        console.log('Certificate data:', updated);
        setCertificate(updated);
      } else {
        // setError(respData.message || 'Certificate not found or invalid.')
        toast.error(respData.message || 'Certificate not found or invalid.')
      }
    } catch (error) {
      console.error('Error fetching certificate:', error)
      toast.error(error.response.data.message || 'Certificate not found or invalid.')
      if(error.response.data.data) {
        setCertificate({...error.response.data.data, status: 'Invalid'})
      }
      // setError('Certificate not found or invalid.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificate()
  }, [batchId, studentId])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Invalid Certificate</p>

  return (
    <Container className="mt-5 mb-4">
      <Toaster position="top-center" reverseOrder={true} />
      <Verify_custom certificate={certificate} />
    </Container>
  )
}

export default CertificateVerification

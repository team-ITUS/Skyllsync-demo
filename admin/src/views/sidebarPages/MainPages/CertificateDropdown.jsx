

import { useState } from 'react'
import { Dropdown, Form, Modal, Button } from 'react-bootstrap'
import { FaEye } from 'react-icons/fa'
import { BASE_URL } from '../../../BaseURL'

const CertificateDropdown = ({ certificates, selectedCertificate, setSelectedCertificate, disabled }) => {
  const [showModal, setShowModal] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')

  const handleSelect = (certificateId) => {
    const selectedCert = certificates.find((cert) => cert.certificateId === certificateId)
    setSelectedCertificate({
      certificateId: selectedCert.certificateId,
      certificateName: selectedCert.certificateName,
      certificateUrl: selectedCert.certificateUrl, // Store the URL for later use
    })
  }

  //   const handleViewCertificate = (certificate) => {
  //     setPdfUrl(certificate?.certificateUrl) // Set the PDF URL
  //     setShowModal(true) // Open the modal
  //   }

  //view pdf
  const handleViewCertificate = (certificate) => {
    if (certificate?.certificateUrl) {
      const fullUrl = `${BASE_URL}/${certificate.certificateUrl}`
      window.open(fullUrl, '_blank') // Open PDF in a new tab
    }
  }

  const dropDownStyle = {
    borderColor: '#dbdfe6',
    color: '#252b36f2',
    fontWeight: '400',
    textAlign: 'left',
    background: 'transparent',
  }

  return (
    <>
      <div className="name-parent">
        <label style={{fontSize: "14px"}}>Certificate</label>
        <div className="dd-mm-yyyy-parent mt-2" style={{ padding: 0 }}>
          <Dropdown onSelect={handleSelect}>
            <Dropdown.Toggle
              disabled={disabled}
              className="custom-date-input d-flex justify-content-between align-items-center"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                width: "100%",
                height: "100%",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                fontSize: "14px",
                color: "rgba(0,0,0,0.6)",
                borderRadius: "40px",
                margin: "2px 2px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              {selectedCertificate.certificateName || "Select Certificate"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {certificates.map((certificate) => (
                <Dropdown.Item
                  key={certificate.certificateId}
                  eventKey={certificate.certificateId}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>{certificate.certificateName}</span>
                  <FaEye
                    className="text-primary ms-4"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent dropdown from closing
                      e.preventDefault();
                      handleViewCertificate(certificate)
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>


    </>
  )
}

export default CertificateDropdown

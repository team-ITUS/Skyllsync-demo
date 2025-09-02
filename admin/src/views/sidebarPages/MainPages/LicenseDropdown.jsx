

import { useState } from 'react'
import { Dropdown, Form, Modal, Button } from 'react-bootstrap'
import { FaEye } from 'react-icons/fa'
import { BASE_URL } from '../../../BaseURL'

const LicenseDropdown = ({ licenses, selectedlicense, setSelectedlicense, disabled }) => {

  const handleSelect = (licenseId) => {
    const selectedLicenses = licenses.find((cert) => cert.licenseId === licenseId)
    setSelectedlicense({
      licenseId: selectedLicenses.licenseId,
      licenseName: selectedLicenses.licenseName,
      licenseUrl: selectedLicenses.licenseUrl, // Store the URL for later use
    })
  }

  //   const handleViewlicense = (license) => {
  //     setPdfUrl(license?.licenseUrl) // Set the PDF URL
  //     setShowModal(true) // Open the modal
  //   }

  //view pdf
  const handleViewLicense = (license) => {
    if (license?.licenseUrl) {
      const fullUrl = `${BASE_URL}/${license.licenseUrl}`
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
  <label style={{fontSize:"14px"}}>License</label>
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
        {selectedlicense.licenseName || "Select license"}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {licenses.map((license) => (
          <Dropdown.Item
            key={license.licenseId}
            eventKey={license.licenseId}
            className="d-flex justify-content-between align-items-center"
          >
            <span>{license.licenseName}</span>
            <FaEye
              className="text-primary ms-2"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleViewLicense(license)
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

export default LicenseDropdown

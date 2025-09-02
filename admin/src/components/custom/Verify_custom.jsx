// Verify_custom.jsx
import React from 'react'
import "./Verify_custom.css"

function Verify_custom({ certificate }) {
  const validateDate = new Date(certificate.validTill);
  const currentDate = new Date();
  const showValidity = validateDate.getFullYear() < (currentDate.getFullYear()+6);
  return (
    <div className="card ira-logo-parent mx-auto my-4 p-5" style={{ maxWidth: "600px" }}>
      <img className="ira-logo-icon" src="IRA_Logo.svg" alt="IRA Logo" />

      <div className="card-body text-center">
        <h2 className="fw-medium mb-4">Certificate Details</h2>

        <div className="myPhotos justify-content-center mb-4">
          <img
            src={certificate.studentImg ? certificate.studentImg : "https://skyllsync.com/uploads/images/default.jpg"}
            alt="Profile"
            className="profile-pic p-1"
          />
          {certificate.status === "Verified" ? <img
            src="solar_verified-check-bold.svg"
            alt="Verified"
            className="verified-badge"
          />: <img
            src="solar_rejected-check-bold.png"
            alt="Rejected"
            className="verified-badge"
          />}
        </div>

        <div className="container textStyle">
          
          <div className="row mb-3">
            <div className="col-5 col-sm-4 fw-semibold text-end">Student :</div>
            <div className="col-7 col-sm-8 text-start">{certificate.studentName}</div>
          </div>
          <div className="row mb-3">
            <div className="col-5 col-sm-4 fw-semibold text-end">Course :</div>
            <div className="col-7 col-sm-8 text-start">{certificate.courseName}</div>
          </div>
          <div className="row mb-3">
            <div className="col-5 col-sm-4 fw-semibold text-end">Certificate ID :</div>
            <div className="col-7 col-sm-8 text-start">{certificate.certCode}</div>
          </div>
          <div className="row mb-3">
            <div className="col-5 col-sm-4 fw-semibold text-end">Issued On :</div>
            <div className="col-7 col-sm-8 text-start">{certificate.issuedOn}</div>
          </div>
          { showValidity && (
            <div className="row mb-3">
            <div className="col-5 col-sm-4 fw-semibold text-end">Valid Till :</div>
            <div style={certificate.status === "Verified" ? {color: "black"} :{color: "red"}} className="col-7 col-sm-8 text-start">{certificate.validTill}</div>
          </div>
          )}
          <div className="row">
            <div className="col-5 col-sm-4 fw-semibold text-end">Status :</div>
            <div style={certificate.status === "Verified" ? {color: "black"} :{color: "red"}} className="col-7 col-sm-8 text-start">{certificate.status}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Verify_custom

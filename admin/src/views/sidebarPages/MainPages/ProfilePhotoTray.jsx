import React from "react";
import { Button, Spinner, Modal } from "react-bootstrap";
import axios from "axios";
import { BASE_URL } from "../../../BaseURL";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import CustomButton from "../../../components/custom/CustomButton";
import InputField from "../../../components/custom/InputField";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)


const trayStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  maxHeight: "400px",
  overflowY: "auto",
  padding: "16px",
  background: "#f8f9fa",
  borderRadius: "12px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
};

const photoBoxStyle = {
  position: "relative",
  width: "145px",
  height: "180px",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
  background: "#fff",
  transition: "box-shadow 0.2s",
};

const completedBoxStyle = {
  ...photoBoxStyle,
  boxShadow: "0 0 10px 10px #28a74623, 0 2px 8px rgba(0,0,0,0.10)",
};

const imgStyle = {
  width: "100%",
  // height: "100%",
  objectFit: "cover",
  borderRadius: "16px",
  display: "block",
};

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(214, 214, 214, 0.45)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "end",
  paddingBottom: "20%",
  opacity: 0,
  transition: "opacity 0.2s",
  zIndex: 2,
};

const photoBoxHoverStyle = {
  ...overlayStyle,
  opacity: 1,
};

export default function ProfilePhotoTray({ batchId, onBack }) {
  const [images, setImages] = React.useState([]);
  const [hovered, setHovered] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [searchName2, setSearchName2] = React.useState(null);
  const [isPhotoDownloading, setIsPhotoDownloading] = useState(false);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [previewImg, setPreviewImg] = useState(null);

  const handleDownloadSelectedPhotos = async () => {

    setIsPhotoDownloading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/batch/downloadBatchPhotos`,
        { batchId: batchId },
        { responseType: 'blob', validateStatus: () => true }
      );
      const ct = response.headers['content-type'];
      if (!ct || !ct.includes('application/zip')) {
        const text = await response.data.text();
        let errorMsg = 'Failed to download photos.';
        try {
          errorMsg = JSON.parse(text).message || errorMsg;
        } catch { }
        throw new Error(errorMsg);
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch_${batchId}_profile_photos.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Profile photos downloaded!');
    } catch (error) {
      toast.error(error.message || 'Failed to download profile photos.');
    } finally {
      setIsPhotoDownloading(false);
    }
  };

  const fetchPhotoTrayList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/batch/getBatchStudentPhotos/${batchId}`);
      if (response.data.success) {
        setImages(response.data.students);
        setRejectedCount(response.data.rejectedCount);
        setUploadedCount(response.data.uploadedCount);
      } else {
        setImages([]);
      }
    } catch (error) {
      setImages([]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (batchId) fetchPhotoTrayList();
    // eslint-disable-next-line
  }, [batchId]);

  const handleAccept = async (studentId) => {
    try {
      await axios.patch(`${BASE_URL}/batch/patchProfileAcception`, {
        studentId,
        isProfile: "Completed"
      });
      setImages(list =>
        list.map(s =>
          s.studentId === studentId ? { ...s, isProfile: "Completed" } : s
        )
      );
    } catch (e) {
      // handle error
      console.error("Error accepting profile photo:", e);
    }
  };

  const handleReject = async (studentId) => {
    try {
      await axios.patch(`${BASE_URL}/batch/patchProfileAcception`, {
        studentId,
        isProfile: "Rejected"
      });
      // Refetch to update tray after rejection (photo may be deleted)
      fetchPhotoTrayList();
    } catch (e) {
      // handle error
      console.error("Error rejecting profile photo:", e);
    }
  };

  const [isPhotoUploading, setIsPhotoUploading] = React.useState(false)
  const [isPatchingProfile, setIsPatchingProfile] = React.useState(false)
  const zipInputRef = React.useRef()

  // 1️⃣ Upload Multi-Photos
  const handleUploadMultiPhotos = () => {
    zipInputRef.current.value = null
    zipInputRef.current.click()
  }
  const onZipSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsPhotoUploading(true)
    try {
      const formData = new FormData()
      formData.append('photosZip', file)
      const { data } = await axios.post(
        `${BASE_URL}/batch/${batchId}/upload-multi-photos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      toast.success(
        `Processed: ${data.processedStudentIds.length}, ` +
        `Missing in DB: ${data.missingInDb.length}, ` +
        `Missing in batch: ${data.missingInBatch.length}`
      )
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setIsPhotoUploading(false)
    }
  }

  // 2️⃣ Mark All Profiles Complete
  const handleAllCompleteProfile = async () => {
    const result = await MySwal.fire({
      title: 'Complete All Eligible?',
      text: 'This will mark all eligible student profiles as Completed. Proceed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Complete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#374174',
      cancelButtonColor: '#EBA135',
      background: '#fefefe',
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      }
    });
    if (result.isConfirmed) {
      setIsPatchingProfile(true)
      try {
        const { data } = await axios.put(
          `${BASE_URL}/batch/${batchId}/all-complete-profile`
        )
        toast.success(data.message)
      } catch (err) {
        console.error(err)
        toast.error(err.response?.data?.message || err.message)
      } finally {
        setIsPatchingProfile(false)
      }
    }
  }
  React.useEffect(() => {
    fetchPhotoTrayList();
    // eslint-disable-next-line
  }, [isPhotoUploading, isPatchingProfile]);

  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
      <div className="row">
        <div className="col-4"></div>
        <div className="col-4 pb-4 text-center">
          <h4 style={{ margin: 0, fontSize: "28px" }}>Profile Photos</h4>
        </div>
        <div className="col-2 d-flex justify-content-end">
          <h4 className="mx-1" style={{fontSize: "18px", color:"#374174"}}>Uploaded: {uploadedCount}</h4>
        </div>
        <div className="col-2 d-flex justify-content-center"> <h4 className="mx-1" style={{fontSize: "18px", color:"#EBA135"}}>Rejected: {rejectedCount}</h4></div>
      </div>
      <div className="row align-items-center mb-3">
        {/* Back Button */}
        <div className="col-3">
          <CustomButton
            title={
              "Back"
            }
            icon="Arrow_b.svg"
            variant="outline"
            onClick={onBack}
          />
        </div>

        {/* Search By Name */}

        <div className="col-2 d-flex justify-content-center">
          <InputField
            value={searchName2}
            onChange={setSearchName2}
            placeholder="Search by student name"
            style={{ width: '300px', marginTop: '0px' }}
          />
        </div>
        {/* Download Button on Right */}
        <div className="col-7 d-flex justify-content-end">
          {/* hidden ZIP input */}
          <input
            type="file"
            accept=".zip"
            style={{ display: 'none' }}
            ref={zipInputRef}
            onChange={onZipSelected}
          />
          <div className="mx-1">
            <CustomButton
              variant="outline"
              title={
                isPatchingProfile ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : (
                  "Complete All"
                )
              }
              icon="Check.svg"
              onClick={handleAllCompleteProfile}
              disabled={isPatchingProfile}
            />
          </div>
          <div className="mx-1">
            <CustomButton
              variant="outline"
              title={
                isPhotoUploading ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : (
                  "Upload Photos"
                )
              }
              icon="Import_b.svg"
              onClick={handleUploadMultiPhotos}
              disabled={isPhotoUploading}
            />
          </div>
          <div className="mx-1">
            <CustomButton
              title={
                isPhotoDownloading ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : (
                  "Download Photos"
                )
              }
              icon="Download_w.svg"
              onClick={handleDownloadSelectedPhotos}
              disabled={isPhotoDownloading}
            />
            <></>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", width: "100%" }}>Loading...</div>
      ) : (
        <div style={trayStyle}>
          {images.length === 0 && (
            <div style={{ color: "#888", fontWeight: 600 }}>No images available</div>
          )}
          {images
            .filter(student =>
              !searchName2 || student?.studentName?.toLowerCase()?.includes(searchName2.toLowerCase())
            ).map((imgObj, idx) => {
              const isCompleted = imgObj.isProfile === "Completed";
              return (
                <div
                  key={imgObj.studentId}
                  style={isCompleted ? completedBoxStyle : photoBoxStyle}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {imgObj.imagePath ? (
                    <>
                      <img src={imgObj.imagePath} alt={`Profile ${idx + 1}`} style={imgStyle} />
                      {/* Student Name below the photo */}
                      <div
                        style={{
                          width: "100%",
                          textAlign: "center",
                          fontWeight: 600,
                          fontSize: 15,
                          color: "#374174",
                          letterSpacing: "0.5px",
                          padding: "6px 4px 6px 10px",
                          borderBottomLeftRadius: "16px",
                          borderBottomRightRadius: "16px",
                          position: "absolute",
                          left: 0,
                          bottom: 0,
                          zIndex: 3,
                          boxShadow: "0 2px 8px rgba(255, 255, 255, 1)",
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                          textShadow: "0 1px 5px rgba(255, 255, 255, 1)",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                        title={imgObj.studentName || "Name Not Available"}
                      >
                        {imgObj.studentName || "Name Not Available"}
                      </div>

                      <div style={hovered === idx ? photoBoxHoverStyle : overlayStyle}>
                        {/* Accept and Reject buttons container */}
                        <div className="d-flex justify-content-start mb-3">
                          <div className="d-flex align-items-center">
                            {!isCompleted && (<button
                              onClick={() => handleAccept(imgObj.studentId)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#28a745',
                                border: 'none',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                margin: '0 4px',
                              }}
                              title="Accept"
                            >
                              <img src="checkmark.svg" alt="Accept" style={{ width: '25px', height: '25px' }} />
                            </button>)}
                            <button
                              onClick={() => handleReject(imgObj.studentId)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#dc3545',
                                border: 'none',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                margin: '0 4px',
                              }}
                              title="Reject"
                            >
                              <img src="crossmark.svg" alt="Reject" style={{ width: '25px', height: '25px' }} />
                            </button>
                          </div>

                          <div className="col-1"></div>
                        </div>
                      </div>

                    </>
                  ) : (
                    <>
                      <div style={{
                        background: "#eee",
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40%",
                        color: "#888",
                        fontWeight: 600,
                        fontSize: 14
                      }}>
                        Image Not Available
                      </div>
                      <div
                        style={{
                          width: "100%",
                          textAlign: "center",
                          fontWeight: 600,
                          fontSize: 15,
                          color: "#374174",
                          letterSpacing: "0.5px",
                          padding: "6px 4px 6px 10px",
                          borderBottomLeftRadius: "16px",
                          borderBottomRightRadius: "16px",
                          position: "absolute",
                          left: 0,
                          bottom: 0,
                          zIndex: 3,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                          textShadow: "0 1px 5px rgba(255, 255, 255, 1)",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                        title={imgObj.studentName || "Name Not Available"}
                      >
                        {imgObj.studentName || "Name Not Available"}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Modal for image preview */}
      {/* <Modal
        show={!!previewImg}
        onHide={() => setPreviewImg(null)}
        centered
        size="lg"
        style={{ maxWidth: "100vw" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Profile Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f8f9fa",
            minHeight: "300px",
          }}
        >
          {previewImg && (
            <img
              src={previewImg}
              alt="Profile Preview"
              style={{
                borderRadius: "24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                maxWidth: "40vw",
                maxHeight: "70vh",
                objectFit: "contain",
                background: "#fff",
              }}
            />
          )}
        </Modal.Body>
      </Modal> */}
    </div>
  );
}
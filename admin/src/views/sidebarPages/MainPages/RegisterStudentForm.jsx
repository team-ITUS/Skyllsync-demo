import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import InputField from "../../../components/custom/InputField";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../../BaseURL";
import Date_Picker from "../../../components/custom/Date_Picker";
import CustomButton from "../../../components/custom/CustomButton";
import { formatName, normalizeEmail } from "../../../utils/dataHelpers";
import { useRef } from "react";

const requiredFields = [
  "name", "email", "dob", "gender", "mobile", "occupation", "qualification", "address", "bloodGrp"
];

const RegisterStudentForm = () => {
  const [loading ,setLoading] = useState(false);
  const profileInputRef = useRef();
  const aadharInputRef = useRef();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    gender: '',
    mobile: '',
    imagePath: null,
    adhaarNo: '',
    occupation: '',
    qualification: '',
    address: '',
    bloodGrp: '',
    adhaarImage: null, // Include Aadhaar image in state
  })

  const handleSubmit = async (e) => {

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
    const maxSize = 5 * 1024 * 1024 // 5MB

    const stdProfile = formData?.imagePath
    const stdAdhar = formData?.adhaarImage

    if (stdProfile) {
      if (!allowedTypes.includes(stdProfile.type)) {
        toast.error('Profile. Only PNG, JPG are allowed.')
        return
      }

      if (stdProfile.size > maxSize) {
        toast.error('Profile size exceeds 5MB limit.')
        return
      }
    }

    if (stdAdhar) {
      if (!allowedTypes.includes(stdAdhar.type)) {
        toast.error('Aadhaar. Only PNG, JPG are allowed.')
        return
      }

      if (stdAdhar.size > maxSize) {
        toast.error('Aadhaar size exceeds 5MB limit.')
        return
      }
    }

    // Validate mobile number length
    if (formData.mobile.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits.', { position: 'top-center' })
      return
    }

    // Profile photo validation
    if (!formData.imagePath) {
      toast.error('Please upload a profile photo');
      return;
    }

    // Aadhaar image validation
    if (!formData.adhaarImage) {
      toast.error('Please upload Aadhaar image');
      return;
    }

    // Prepare form data to send to the backend
    const formDataToSend = new FormData()
    formDataToSend.append('name', formatName(formData.name))
    formDataToSend.append('email', normalizeEmail(formData.email))
    formDataToSend.append('dob', formData.dob)
    formDataToSend.append('gender', formData.gender)
    formDataToSend.append('mobile', formData.mobile)
    formDataToSend.append('occupation', formData.occupation)
    formDataToSend.append('qualification', formData.qualification)
    formDataToSend.append('address', formData.address)
    formDataToSend.append('bloodGrp', formData.bloodGrp)

    // Append files using the correct keys
    if (formData.imagePath) {
      formDataToSend.append('imagePath', formData.imagePath) // Change 'file' to 'imagePath'
    }

    if (formData.adhaarImage) {
      formDataToSend.append('aadharImage', formData.adhaarImage) // Use the correct key
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/student/register`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.data.success) {
        toast.success(res.data.message || "Registration successful!");
        if (profileInputRef.current) profileInputRef.current.value = "";
        if (aadharInputRef.current) aadharInputRef.current.value = "";
        setFormData({
          name: "",
          email: "",
          dob: "",
          gender: "",
          mobile: "",
          imagePath: null,
          occupation: "",
          qualification: "",
          address: "",
          bloodGrp: "",
          adhaarImage: null,
        });
      } else {
        toast.error(res.data.message || "Error");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error");
    }
    setLoading(false);
    // reload the page to reset the form
  };

  return (
    <Container className="mainTableContainer">
      <div className="row p-2 my-1">
        <div className="col-2"></div>
        <div className="col-8"> 
          <h4 className="text text-center" style={{ color: "black", marginBottom: "3%", fontSize: "28px" }}>
        Trainee Registration Form
          </h4>
        </div>
      </div>
      <Form className="">
        <div className="row mb-1 justify-content-center">
          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Name"
              type="text"
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              placeholder="Enter name"
            />
          </div>
          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Email"
              type="email"
              value={normalizeEmail(formData.email)}
              onChange={(val) => setFormData({ ...formData, email: val })}
              placeholder="Enter Email"
            />
          </div>

          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <Date_Picker
              label="Date of Birth" value={formData.dob}
              placeholder="Enter Date of Birth"
              onChange={(val) => setFormData({ ...formData, dob: val })} />
          </div>
          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Gender"
              type="select"
              value={formData.gender}
              onChange={(val) => setFormData({ ...formData, gender: val })}
              placeholder="Select Gender"
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
            />
          </div>

          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Mobile"
              type="tel"
              value={formData.mobile}
              onChange={(val) => setFormData({ ...formData, mobile: val })}
              placeholder="Enter mobile no"
            />
          </div>
          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Address"
              type="text"
              value={formData.address}
              onChange={(val) => setFormData({ ...formData, address: val })}
              placeholder="Enter Address"
            />
          </div>

          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Student Image (PNG, JPG up to 5MB)"
              type="file"
              // remove binding to value—files are read-only inputs
              inputRef={profileInputRef}
              value={formData.imagePath}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, imagePath: file });
                }
              }}
            />
          </div>
          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Aadhaar Image (PNG, JPG up to 5MB)"
              type="file"
              inputRef={aadharInputRef}
              value={formData.adhaarImage}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, adhaarImage: file });
                }
              }}
            />
          </div>

          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Occupation"
              type="text"
              value={formData.occupation}
              onChange={(val) => setFormData({ ...formData, occupation: val })}
              placeholder="Enter Occupation"
            />
          </div>
          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Qualification"
              type="text"
              value={formData.qualification}
              onChange={(val) => setFormData({ ...formData, qualification: val })}
              placeholder="Enter Qualification"
            />
          </div>

          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
            <InputField
              label="Blood Group"
              type="select"
              value={formData.bloodGrp}
              onChange={(val) => setFormData({ ...formData, bloodGrp: val })}
              placeholder="Select Blood Group"
              options={[
                "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"
              ]}
            />

          </div>
          <div className="col-lg-4 px-4 pb-4 col-md-6 col-xs-12">
          </div>
        
        </div>
        <div className="px-3" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CustomButton onClick={handleSubmit} title="Submit" icon="Check.svg" />
        </div>
      </Form>
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </Container>
  );
};

export default RegisterStudentForm;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../BaseURL';
import { Row, Button, Container,Col } from 'react-bootstrap';
import '../../SidebarCss/Form.css';
import '../../SidebarCss/Table.css';

const AppSetting = () => {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [existingImage, setExistingImage] = useState(null);
  const [logo, setLogo] = useState(null);
  const [messages, setMessages] = useState('');
  const [existingLogo, setExistingLogo] = useState(null);

  // Fetch existing image when the component mounts
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/profile/get-image`);
        if (response.data.images.length > 0) {
          setExistingImage(response.data.images[0].imagePath); // Assuming you only want the first image
        }
      } catch (error) {
        console.error('Error fetching existing image:', error);
        setMessage('Error fetching existing image');
      }
    };

    fetchImage();
  }, []);

 // Fetch existing logo when the component mounts
useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/profile/get-logo`);
        if (response.data.logos.length > 0) {
          setExistingLogo(response.data.logos[0].logoPath); // Assuming you only want the first logo
        }
      } catch (error) {
       console.error('Error fetching existing logo:', error);
        setMessages('Error fetching existing logo');
      }
    };
  
    fetchLogo();
  }, []);

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
  };

  // Handle image submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setMessage('Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post(`${BASE_URL}/profile/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message);
      setImage(null);

      // Update existing image path if returned
      if (response.data.image.imagePath) {
        setExistingImage(response.data.image.imagePath);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('Error uploading image');
     
    }
  };
  const handleSubmitLogo = async (e) => {
    e.preventDefault();
    if (!logo) {
      setMessages('Please select a logo to upload');
      return;
    }
  
    const formData = new FormData();
    formData.append('logo', logo);
  
    try {
      const response = await axios.post(`${BASE_URL}/profile/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setMessages(response.data.message);
      setLogo(null);
  
      // Update existing logo path if it exists in the response
      if (response.data.logo && response.data.logo.logoPath) {
        setExistingLogo(response.data.logo.logoPath);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessages('Error uploading logo');
    
    }
  };

  return (
    <Container className="mt-4 justify-content-center">
      <div className="form-container shadow p-4 rounded" style={{ maxWidth: '700px' }}>
      <Row>
        <Col lg={6}>
        <h3 className=" mb-2">{existingImage ? 'Update Loader Img' : 'Upload Loader Img'}</h3>
        <form onSubmit={handleSubmit}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <Button 
            type="submit" 
            size="sm"
            style={{ color: 'white' }}
            className="comAddBtn mt-2"
          >
            {existingImage ? 'Update' : 'Upload'}
          </Button> 
        </form>
        {message && <p>{message}</p>}
        
        {/* Display the uploaded or updated image */}
        {existingImage && (
          <div>
            <img src={`${BASE_URL}/${existingImage}`} alt="Profile" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
          </div>
        )}
      
      </Col>

      <Col lg={6}>
       
          <h3 className=" mb-2">{existingLogo ? 'Update Logo' : 'Upload Logo'}</h3>
          <form onSubmit={handleSubmitLogo}>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            <Button 
              type="submit" 
              size="sm"
              style={{ color: 'white' }}
              className="comAddBtn mt-2"
            >
              {existingLogo ? 'Update' : 'Upload'}
            </Button> 
          </form>
          {messages && <p>{messages}</p>}
          
          {/* Display the uploaded or updated logo */}
          {existingLogo && (
            <div>
              <img src={`${BASE_URL}/${existingLogo}`} alt="Logo" style={{  height: '50px', objectFit: 'cover' }} />
            </div>
          )}
            </Col>
       
      </Row>
      </div>
    </Container>
  );
};

export default AppSetting;

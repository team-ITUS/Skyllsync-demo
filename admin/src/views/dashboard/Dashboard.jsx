import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { BASE_URL } from '../../BaseURL';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Assuming you have a CSS file for styling

const StatCard = ({ title, value, icon, onClick }) => (
  <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
    <div
      className="stat-card-new"
      onClick={onClick}
      // style={{ 
      //     cursor: 'pointer',
      //     width: "220px",
      //     height: "220px"
      //  }}
    >
      <div className='d-flex flex-column align-items-start justify-content-start'>
        <div className="stat-icon">
        <img src={icon} alt={title} style={{ width: 40, height: 40 }} />
      </div>
      <div className="stat-value" style={value ? {}: {opacity: 0}}>{value? value: "Hidden"}</div>
      <div className="stat-label">{title}</div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [statsData, setStatsData] = useState([]);
  const navigate = useNavigate();
  const profileName = localStorage.getItem('userName')
  useEffect(() => {
    const fetchAdminDBDtl = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/getAdminDBDtl`);
        const { adminDBDtl } = response.data;

        const updatedStatsData = [
          { id: 1, title: 'Students', value: adminDBDtl?.noOfStudent, icon: './dash_student.svg', path: '/registered-students' },
          { id: 2, title: 'Trainers', value: adminDBDtl?.noOfTrainer, icon: './dash_trainer.svg', path: '/trainer-details' },
          { id: 3, title: 'Examiners', value: adminDBDtl?.noOfAccessor, icon: './dash_examiner.svg', path: '/accessor-details' },
          { id: 4, title: 'Courses', value: adminDBDtl?.noOfCourse, icon: './dash_course.svg', path: '/course-details' },
          { id: 5, title: 'Batches', value: adminDBDtl?.noOfBatch, icon: './dash_batch.svg', path: '/all-batch' },
          { id: 6, title: 'Branches', value: adminDBDtl?.noOfBranch, icon: './dash_branch.svg', path: '/all-branches' },
          { id: 7, title: 'Certificates', icon: './dash_certificate.svg', path: '/certificate-template' },
          { id: 8, title: 'License', icon: './dash_license.svg', path: '/license-template' },
        ];

        setStatsData(updatedStatsData);
      } catch (error) {
        console.error("Error fetching admin DB details:", error);
      }
    };

    fetchAdminDBDtl();
  }, []);

  return (
    <Container fluid className="p-4">
      <div className="dashboard-header mb-4 px-4 d-flex align-items-end justify-content-start" style={{backgroundImage: 'url(dash_bg.png)'}}>
        <div>
          <h4 style={{ fontWeight: 'bold', color: '#374174' }}>Hello, {profileName}!</h4>
          <p style={{color: 'black'}}>Access the summary of key metrics and student’s data.</p>
          </div>  
      </div>

      <Row>
        {statsData.map(stat => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            onClick={() => navigate(stat.path)}
          />
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;

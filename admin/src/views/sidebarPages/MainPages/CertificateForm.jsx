

import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../BaseURL';

const CertificateForm = () => {
    const [studentName, setStudentName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send the form data to the backend to generate the PDF
            const response = await axios.post(`${BASE_URL}/certificate/downloadCert`, {
                batchId: "ea24981f-bb09-4f67-9827-ec9f52809037",
                studentId: "4b9fcd96-3c5b-42ea-a4b9-64d86cfa6d7a"
            }, {
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Create a link element to download the PDF
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sandipcertificate.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); 

            // Revoke the object URL to free memory
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating certificate:', error);
            alert('Error generating certificate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Generate Certificate</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Student Name:</label>
                    <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        
                    />
                </div>
                <div>
                    <label>Course Name:</label>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        
                    />
                </div>
                <div>
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Certificate'}
                </button>
            </form>
        </div>
    );
};

export default CertificateForm;


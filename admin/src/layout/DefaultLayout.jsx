import React, { useEffect, useState } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index.jsx'
import { toast } from "react-toastify";
import { BASE_URL } from '../BaseURL';

const DefaultLayout = () => {
  const [logos, setLogos] = useState([]); // State to hold multiple logos
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch(`${BASE_URL}/profile/get-logo`); // Adjust the URL as needed
        const data = await response.json();
        if (data.logos.length > 0) {
          setLogos(data.logos); // Store the logos array in state
        }
      } catch (error) {
        console.error("Error fetching logos:", error);
        toast.error("Failed to load logos", { position: "top-center" });
      }
    };

    fetchLogos();
    }, []);
  return (
    <div>
      <AppSidebar logos={logos} />
      <div className="wrapper d-flex flex-column min-vh-100" style={{backgroundColor:"#F5F9FF"}}>
        <AppHeader logos={logos} />
        <div className="body flex-grow-1" style={{backgroundColor:"#F5F9FF", marginTop: "75px"}}>
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout

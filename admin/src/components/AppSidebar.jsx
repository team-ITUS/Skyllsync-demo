import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilExitToApp } from "@coreui/icons";
import { AppSidebarNav } from "./AppSidebarNav";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { sygnet } from "src/assets/brand/sygnet";
import admin from '../adminNav.jsx';
import trainer from '../trainerNav.jsx';
import accessor from '../accessorNav.jsx';
import { BASE_URL } from '../BaseURL';
import './AppSidebar.css'; // Import the CSS file for custom styles
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

const AppSidebar = ({logos}) => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const navigate = useNavigate();
  
  const [nav, setNav] = useState([]);

  const handleLogout = async () => {
  const result = await MySwal.fire({
    title: 'Are you sure?',
    text: 'You will be logged out from your session.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#374174',  // Navy Blue
    cancelButtonColor: '#EBA135',   // Yellow
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel',
    background: '#fefefe',
    reverseButtons: true,
    customClass: {
      popup: 'custom-swal-popup',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
    },
  })

  if (result.isConfirmed) {
    localStorage.clear()
    await MySwal.fire({
      title: 'Logged out',
      text: 'You have been successfully logged out.',
      icon: 'success',
      confirmButtonColor: '#374174',
      background: '#fefefe',
    })
    navigate('/') // Redirect to home page
  }
}

  useEffect(() => {
    const role = localStorage.getItem('role');
    
    if (role === 'admin') {
      setNav(admin);
    } else if (role === 'trainer') {
      setNav(trainer);
    } else {
      setNav(accessor);
    }
  }, []);

  useEffect(() => {
  const mainEl = document.querySelector('.sidebar ~ .wrapper'); // or whatever matches
  if (mainEl) {
    mainEl.classList.remove('sidebar-expanded', 'sidebar-collapsed');
    mainEl.classList.add(sidebarShow ? 'sidebar-expanded' : 'sidebar-collapsed');
  }
}, [sidebarShow]);


  return (
    
    <CSidebar
      className="c-sidebar c-sidebar-fixed c-sidebar-lg-show border-end-0 my-sidebar"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      onClick={!sidebarShow ? () => dispatch({ type: "set", sidebarShow: true }) : null}
      onVisibleChange={(visible) => {
        dispatch({ type: "set", sidebarShow: visible });
      }}
      style={{
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
        top: "60px",
        ...(!sidebarShow ? { width: "60px" } : {}),
        borderTopRightRadius: "20px",
        borderBottomRightRadius: "20px",
        backgroundColor: "#1F3F89",
        height: 'calc(100vh - 60px)',
        zIndex: 1050,
      }}
    >
      {/* <CSidebarHeader
        className="border-bottom-0"
        style={{ borderBottom: "none" }}
      >
        <CSidebarBrand to="/dashboard">
          <div>
            {logos.map((logo, index) => (
              <img 
                key={index} 
                src={`${BASE_URL}/${logo.logoPath}`} 
                alt="Uploaded" 
                height={40} 
              />
            ))}
          </div>
          <CIcon
            customClassName="sidebar-brand-narrow"
            icon={sygnet}
            height={32}
          />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: "set", sidebarShow: false })}
        />
      </CSidebarHeader> */}

      {/* Sidebar Navigation */}
      <AppSidebarNav key={sidebarShow ? 'open' : 'closed'} items={nav} sidebarShow={sidebarShow} />

      <CSidebarFooter className="border-top d-none d-lg-flex justify-content-between align-items-center">
        <div
          className="d-flex align-items-center"
          style={{
            cursor: "pointer",
            padding: "0px 5px",
            transition: "background-color 0.3s",
          }}
          onClick={handleLogout}
          
        >
          <img
            src="logout.svg"
            style={{ marginRight: "10px", color: "white" }}
          />
          {sidebarShow && (<span style={{ color: "white" }}>Logout</span>)}
        </div>
      </CSidebarFooter>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);

import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CContainer, CHeader, CHeaderToggler } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { Button } from 'react-bootstrap'
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom' // Import useLocation
import { AiOutlineArrowLeft } from 'react-icons/ai';
import '../views/SidebarCss/Table.css'
import { BASE_URL } from '../BaseURL'

const AppHeader = ({logos}) => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()
  const location = useLocation() // Use location to get current path
  const [iconOrNot, setIconOrNot] = useState(false)
  // Get profileName from localStorage
  const profileName = localStorage.getItem('userName')

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    document.addEventListener('scroll', handleScroll)

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleBack = () => {
    const isLoggedIn = localStorage.getItem('userName')
    if (!isLoggedIn || isLoggedIn.trim() === '') {
      navigate('/login')
    } else {
      navigate(-1)
    }
  }

  return (
    <>
      <CHeader
        position="sticky"
        className="p-0"
        ref={headerRef}
        style={{
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1050,
          background: '#fff'
        }}
      >
        <CContainer className="px-4" fluid>
          <div className="d-flex align-items-center justify-content-between w-100">
            {/* Back Button next to Toggler, only show if not on /dashboard */}
            <div className="d-flex align-items-center">
              
              <CHeaderToggler
                onClick={() => {dispatch({ type: 'set', sidebarShow: !sidebarShow }); setIconOrNot(!iconOrNot)}}
                style={{ marginInlineStart: '-14px' }}
              >{sidebarShow ? 
                <img src="sidebar_closed.svg" style={{width: "30px"}} />:
                <img src="sidebar.svg" style={{width: "30px"}} />

              }
              </CHeaderToggler>
              <div>
                {logos.map((logo, index) => (
                  <div key={index} style={{height: '50px', marginLeft: '15px', marginTop: '5px', display: 'inline-block'}}>
                    <img className='logo-image'
                    key={index} 
                    src={`${BASE_URL}/${logo.logoPath}`} 
                    alt="Uploaded"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  </div>
                ))}
              </div>

              {/* {location.pathname !== '/dashboard' && (
                <Button 
                  variant="link"
                  className="d-flex align-items-center me-2" 
                  onClick={handleBack}
                  style={{ fontSize: '14px', color: 'black' }}
                >
                  Back
                  <AiOutlineArrowLeft className="me-1" />
                </Button>
              )} */}
            </div>

            {/* Profile Name */}
            <span className="ml-auto" style={{ fontSize: '18px' }}>
              Hi, {profileName}!
            </span>
            {/* <span className="ml-auto d-flex align-items-center" style={{ fontSize: '18px' }}>
              <div style={{ borderRadius: '50%', width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginRight: '10px' }}>
                <img
                  src="./user.svg"
                  alt="Profile"
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
              </div>
            </span> */}
          </div>
        </CContainer>
      </CHeader>

      <Toaster
  position="top-center"
  reverseOrder={true}
/>
    </>
  )
}

export default AppHeader
import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/custom/Table_DatePicker.css'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import AdminLogin from './views/sidebarPages/Loginpages/AdminLogin';
import AccessorLogin from './views/sidebarPages/Loginpages/AccessorLogin';
import CertificateVerification from './views/sidebarPages/MainPages/CertificateVerification';
import StudentAttachToBatch from './views/sidebarPages/MainPages/StudentAttachToBatch';
// import { RecaptchaV3Provider } from './components/custom/RecaptchaV3';
import axios from 'axios';
import { setFeatures } from './store/featuresSlice';
import { BASE_URL } from './BaseURL';
import LandingHome from './LandingHome';
// Containers (static import to avoid dynamic chunk fetch issues)
import DefaultLayout from './layout/DefaultLayout';

// Pages
const TEMP_ADMIN_ID = '6700ce54881421e606f2aee5';

const AppContent = () => {
  const dispatch = useDispatch();
  const features = useSelector(state => state.features?.data);
  const theme = useSelector(state => state.theme?.data);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/optionalFeatures/getOptionalFeatures/${TEMP_ADMIN_ID}`); // Adjust endpoint as needed
        dispatch(setFeatures(res.data));
        console.log('OptionalFeatures:', res.data);
      } catch (err) {
        console.error('Error fetching features:', err);
      }
    };
    fetchOptions();
  }, [dispatch]);

  useEffect(() => {
  // You can fetch theme separately if needed, or use features.themeId
  }, [theme]);

  return (
    // Use noslash so URLs like #home are preserved (instead of default #/home)
    <HashRouter hashType="noslash">
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route path="/" name="Home Page" element={<LandingHome />} />
          {/* Map section-only hash paths to LandingHome so anchors like #home or #about don't fall through to wildcard */}
          <Route path="home" element={<LandingHome />} />
          <Route path="why-choose" element={<LandingHome />} />
          <Route path="about" element={<LandingHome />} />
          <Route path="how-it-works" element={<LandingHome />} />
          <Route path="contact" element={<LandingHome />} />
          <Route path="/login" name="Admin Login " element={<AdminLogin />} />
          <Route path="/accessorlogin" name="Accessor Login " element={<AccessorLogin/>} />
          <Route path="/verify/:batchId/:studentId" name="verify"  element={<CertificateVerification />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
          <Route path="/share/:token/:batchName" element={<StudentAttachToBatch />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;

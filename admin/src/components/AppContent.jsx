import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import routes from '../routes'
import ProtectedRoute from './ProtectedRoute.jsx'



const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            const isProtected = route.path !== '/adminlogin'
            return (
              route.element && (
                // <Route
                //   key={idx}
                //   path={route.path}
                //   exact={route.exact}
                //   name={route.name}
                //   element={<route.element />}
                // />
                <Route
                  key={idx}
                  path={route.path}
                  element={
                    isProtected ? <ProtectedRoute element={<route.element />} /> : <route.element />
                  }
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)


import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userLogDetail = localStorage.getItem('role');
    setIsAuthenticated(userLogDetail);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
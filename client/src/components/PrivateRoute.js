import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PrivateRoute = () => {
  const { authState } = useContext(AuthContext);
  
  if (authState.loading) {
    return <div className="loading-screen">로딩 중...</div>;
  }
  
  return authState.isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
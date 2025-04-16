import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { authState } = useContext(AuthContext);
  
  if (authState.loading) {
    return <div className="loading-screen">로딩 중...</div>;
  }
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const hasAllowedRole = allowedRoles.includes(authState.user.role);
  
  return hasAllowedRole ? <Outlet /> : <Navigate to="/unauthorized" />;
};

export default RoleRoute;
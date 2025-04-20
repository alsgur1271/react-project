import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { authState } = useContext(AuthContext);
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  console.log('사용자 정보', authState.User); // 로그 추가
  
  // 관리자 체크
  if (allowedRoles.includes('admin') && authState.user.verified === 2) {
    return <Outlet />;
  }
  
  // 일반 역할 체크
  if (allowedRoles.includes(authState.user.role)) {
    return <Outlet />;
  }
  
  // 관리자이면 관리자 대시보드로, 아니면 각자 역할에 맞는 대시보드로
  if (authState.user.verified === 2) {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (authState.user.role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace />;
  } else if (authState.user.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default RoleRoute;
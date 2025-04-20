// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getUserProfile } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userData = await getUserProfile();
          setAuthState({
            isAuthenticated: true,
            user: userData,
            loading: false
          });
        } catch (err) {
          localStorage.removeItem('token');
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };
    
    checkAuth();
  }, []);
  


const login = async (credentials) => {
  try {
    console.log('로그인 시도:', credentials);
    const response = await loginUser(credentials);
    
    // 응답 객체 자세히 로깅
    console.log('로그인 응답 전체:', response);
    console.log('사용자 객체:', response.user);
    console.log('사용자 역할:', response.user.role);
    console.log('사용자 verified 값:', response.user.verified);
    
    localStorage.setItem('token', response.token);
    
    setAuthState({
      isAuthenticated: true,
      user: response.user,
      loading: false
    });
    
    // 역할에 따른 리디렉션
    console.log('리디렉션 조건 확인 중...');
    
    if (response.user.role === 'admin') {
      console.log('관리자 권한 확인됨, 관리자 대시보드로 리디렉션');
      navigate('/admin/dashboard');
      return true;
    } else if (response.user.role === 'teacher') {
      console.log('선생님 권한 확인됨, 선생님 대시보드로 리디렉션');
      navigate('/teacher/dashboard');
      return true;
    } else {
      console.log('학생 권한 확인됨, 학생 대시보드로 리디렉션');
      navigate('/student/dashboard');
      return true;
    }
  } catch (err) {
    console.error('로그인 오류:', err);
    return false;
  }
};
  
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    navigate('/login');
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        authState, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
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
      const response = await loginUser(credentials);
      localStorage.setItem('token', response.token);
      
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        loading: false
      });
      
      // 역할에 따른 리디렉션
      if (response.user.email_verified === 2) {
        navigate('/admin/dashboard');
      } else if (response.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
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
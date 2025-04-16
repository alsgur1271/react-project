import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // import 방식 변경
import { getUserProfile } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
        return;
      }
      
      try {
        // 토큰 만료 확인
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // 토큰 만료 처리
          localStorage.removeItem('token');
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          });
          return;
        }
        
        // 사용자 정보 가져오기
        const userData = await getUserProfile();
        
        setAuthState({
          isAuthenticated: true,
          user: userData,
          loading: false
        });
      } catch (err) {
        console.error('인증 상태 로드 오류:', err);
        localStorage.removeItem('token');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };
    
    loadUser();
  }, []);
  
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };
  
  return (
    <AuthContext.Provider value={{ authState, setAuthState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
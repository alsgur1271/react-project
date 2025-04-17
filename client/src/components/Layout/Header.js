import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';
import './Header.css';

const Header = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (authState.isAuthenticated) {
      // 역할에 따라 대시보드로 이동
      if (authState.user.email_verified === 2) {
        navigate('/admin/dashboard');
      } else if (authState.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (authState.user.role === 'student') {
        navigate('/student/dashboard');
      }
    } else {
      navigate('/');
    }
  };
  
  return (
    <header className="main-header">
      <div className="header-container">
        <a href="/" className="header-logo" onClick={handleLogoClick}>
          <img src={logo} alt="TogetherOn Logo" />
        </a>
        
        <nav className="header-nav">
          {authState.isAuthenticated && (
            <>
              {authState.user.role === 'teacher' && (
                <Link to="/teacher/dashboard" className="nav-link">
                  대시보드
                </Link>
              )}
              
              {authState.user.role === 'student' && (
                <Link to="/student/dashboard" className="nav-link">
                  대시보드
                </Link>
              )}
            </>
          )}
        </nav>
        
        <div className="header-actions">
          {authState.isAuthenticated ? (
            <button onClick={() => logout()} className="profile-btn">
              로그아웃
            </button>
          ) : (
            <Link to="/login" className="login-btn">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
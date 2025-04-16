import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { AccessibilityContext } from '../../contexts/AccessibilityContext';
import logo from '../../assets/logo.svg';
import './Header.css'; // 새 CSS 파일을 생성하여 스타일 분리

const Header = () => {
  const { authState, logout } = useContext(AuthContext);
  const { accessibilitySettings, updateSettings } = useContext(AccessibilityContext);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleHighContrast = () => {
    updateSettings({
      ...accessibilitySettings,
      highContrast: !accessibilitySettings.highContrast
    });
  };
  
  const changeFontSize = (size) => {
    updateSettings({
      ...accessibilitySettings,
      fontSize: size
    });
  };
  
  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src={logo} alt="TogetherOn Logo" />
        </Link>
        
        <nav className="header-nav">
          {authState.isAuthenticated && (
            <>
              <Link to={`/${authState.user.role}/dashboard`} className="nav-link">
                대시보드
              </Link>
              
              {authState.user.role === 'teacher' && (
                <Link to="/teacher/sessions" className="nav-link">
                  내 수업
                </Link>
              )}
              
              {authState.user.role === 'student' && (
                <Link to="/student/schedule" className="nav-link">
                  수업 일정
                </Link>
              )}
            </>
          )}
        </nav>
        
        <div className="header-actions">
          <button 
            className="accessibility-btn"
            aria-label="접근성 설정"
            onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
              <line x1="12" y1="2" x2="12" y2="4"></line>
              <line x1="12" y1="20" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="4" y2="12"></line>
              <line x1="20" y1="12" x2="22" y2="12"></line>
            </svg>
          </button>
          
          {showAccessibilityMenu && (
            <div className="accessibility-menu">
              <div className="accessibility-option">
                <label>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.highContrast}
                    onChange={toggleHighContrast}
                  />
                  고대비 모드
                </label>
              </div>
              
              <div className="accessibility-option">
                <label>글꼴 크기</label>
                <div className="font-size-options">
                  <button 
                    className={accessibilitySettings.fontSize === 'small' ? 'active' : ''}
                    onClick={() => changeFontSize('small')}
                  >
                    작게
                  </button>
                  <button 
                    className={accessibilitySettings.fontSize === 'medium' ? 'active' : ''}
                    onClick={() => changeFontSize('medium')}
                  >
                    중간
                  </button>
                  <button 
                    className={accessibilitySettings.fontSize === 'large' ? 'active' : ''}
                    onClick={() => changeFontSize('large')}
                  >
                    크게
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {authState.isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                className="user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="profile-avatar">
                  {authState.user.username?.charAt(0).toUpperCase()}
                </div>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-info">
                    <strong>{authState.user.username}</strong>
                    <span className="user-role">{authState.user.role === 'teacher' ? '선생님' : '학생'}</span>
                  </div>
                  <Link to="/profile" className="dropdown-item">내 프로필</Link>
                  <Link to="/settings/accessibility" className="dropdown-item">설정</Link>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
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
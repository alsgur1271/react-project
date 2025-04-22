// src/components/Layout/Header.js
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { AccessibilityContext } from '../../contexts/AccessibilityContext';
import logo from '../../assets/logo.svg';
import '../../styles/Header.css';


const Header = () => {
  const { authState, logout } = useContext(AuthContext);
  const { accessibilitySettings, updateSettings } = useContext(AccessibilityContext);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  
  const navigate = useNavigate();
  
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (authState.isAuthenticated) {
      // 역할에 따라 대시보드로 이동
      if (authState.user.verified === 2) {
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
  
  const toggleAccessibilityMenu = () => {
    setShowAccessibilityMenu(!showAccessibilityMenu);
  };

  const toggleScreenReader = () => {
    updateSettings({ 
      ...accessibilitySettings, 
      screenReader: !accessibilitySettings.screenReader 
    });
  };
  
  const handleFontSizeChange = (size) => {
    updateSettings({ ...accessibilitySettings, fontSize: size });
    setShowAccessibilityMenu(false);
  };
  
  const toggleHighContrast = () => {
    updateSettings({ 
      ...accessibilitySettings, 
      highContrast: !accessibilitySettings.highContrast 
    });
  };
  
  const goToSettings = () => {
    navigate('/settings');
    setShowAccessibilityMenu(false);
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
          {authState.isAuthenticated && (
            <>
              <div className="accessibility-dropdown">
                <button 
                  className="accessibility-btn" 
                  onClick={toggleAccessibilityMenu}
                  aria-label="접근성 메뉴"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </button>
                
                {showAccessibilityMenu && (
                  <div className="accessibility-menu">
                    <div className="menu-header">
                      <h3>접근성 설정</h3>
                    </div>
                    
                    <div className="menu-section">
                      <h4>글꼴 크기</h4>
                      <div className="font-size-options">
                        <button 
                          className={accessibilitySettings.fontSize === 'small' ? 'active' : ''}
                          onClick={() => handleFontSizeChange('small')}
                        >
                          작게
                        </button>
                        <button 
                          className={accessibilitySettings.fontSize === 'medium' ? 'active' : ''}
                          onClick={() => handleFontSizeChange('medium')}
                        >
                          중간
                        </button>
                        <button 
                          className={accessibilitySettings.fontSize === 'large' ? 'active' : ''}
                          onClick={() => handleFontSizeChange('large')}
                        >
                          크게
                        </button>
                      </div>
                    </div>
                    
                    <div className="menu-section">
                      <h4>고대비 모드</h4>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={accessibilitySettings.highContrast}
                          onChange={toggleHighContrast}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="menu-section">
                      <h4>스크린 리더 지원</h4>
                     <label className="toggle-switch">
                      <input 
                         type="checkbox" 
                         checked={accessibilitySettings.screenReader || false}
                          onChange={toggleScreenReader}
                      />
                     <span className="toggle-slider"></span>
                     </label>
                    </div>
                    
                    <div className="menu-footer">
                      <button 
                        className="settings-link"
                        onClick={goToSettings}
                      >
                        모든 설정
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="user-menu">
                <button
                  className="profile-btn"
                  onClick={() => navigate('/settings')}
                >
                  {authState.user.username}
                </button>
                <button className="logout-btn" onClick={logout}>
                  로그아웃
                </button>
              </div>
            </>
          )}
          
          {!authState.isAuthenticated && (
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
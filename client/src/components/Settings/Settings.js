// src/components/Settings/Settings.js
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { AccessibilityContext } from '../../contexts/AccessibilityContext';
import { updateUserProfile } from '../../services/api';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import '../../styles/Settings.css';



const Settings = () => {
  const { authState } = useContext(AuthContext);
  const { accessibilitySettings, updateSettings } = useContext(AccessibilityContext);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // 초기 프로필 정보 로드
  useEffect(() => {
    if (authState.user) {
      setProfileForm({
        ...profileForm,
        username: authState.user.username || '',
        email: authState.user.email || ''
      });
    }
  }, [authState.user]);
  
  // 프로필 폼 변경 처리
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  // 프로필 업데이트 처리
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    // 비밀번호 변경 시 검증
    if (profileForm.newPassword) {
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setMessage({ type: 'error', text: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.' });
        setLoading(false);
        return;
      }
      
      if (!profileForm.currentPassword) {
        setMessage({ type: 'error', text: '현재 비밀번호를 입력해주세요.' });
        setLoading(false);
        return;
      }
    }
    
    try {
      // 프로필 업데이트 API 호출
      const updateData = {
        username: profileForm.username,
        email: profileForm.email
      };
      
      // 비밀번호 변경이 포함된 경우
      if (profileForm.newPassword && profileForm.currentPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }
      
      await updateUserProfile(updateData);
      
      setMessage({ type: 'success', text: '프로필이 성공적으로 업데이트되었습니다.' });
      // 비밀번호 필드 초기화
      setProfileForm({
        ...profileForm,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || '프로필 업데이트 중 오류가 발생했습니다.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 접근성 설정 변경 처리
  const handleFontSizeChange = (e) => {
    updateSettings({
      ...accessibilitySettings,
      fontSize: e.target.value
    });
  };
  
  const handleHighContrastChange = (e) => {
    updateSettings({
      ...accessibilitySettings,
      highContrast: e.target.checked
    });
  };

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <Sidebar />
        
        <main className="main-content">
          <div className="settings-container">
            <div className="settings-header">
              <h1>설정</h1>
            </div>
            
            <div className="settings-tabs">
              <button 
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                프로필
              </button>
              <button 
                className={`tab-btn ${activeTab === 'accessibility' ? 'active' : ''}`}
                onClick={() => setActiveTab('accessibility')}
              >
                접근성
              </button>
              <button 
                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                알림
              </button>
            </div>
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div className="settings-content">
                <h2>프로필 설정</h2>
                <form onSubmit={handleProfileSubmit} className="settings-form">
                  <div className="form-group">
                    <label htmlFor="username">사용자명</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">이메일</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  
                  <div className="settings-section">
                  <div className="section-header">
                     <h3>비밀번호 변경</h3>
                      <button 
                      type="button" 
                      className="toggle-btn"
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      aria-expanded={showPasswordSection}
                     >
                  {showPasswordSection ? '숨기기' : '변경하기'}
                     </button>
                     </div>
  
                    {showPasswordSection && (
                     <>
                      <div className="form-group">
                        <label htmlFor="currentPassword">현재 비밀번호</label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={profileForm.currentPassword}
                          onChange={handleProfileChange}
                          required={!!profileForm.newPassword}
                           />
                     </div>
      
                       <div className="form-group">
                       <label htmlFor="newPassword">새 비밀번호</label>
                         <input
                           type="password"
                           id="newPassword"
                           name="newPassword"
                           value={profileForm.newPassword}
                         onChange={handleProfileChange}
                          />
                       </div>
      
                      <div className="form-group">
                       <label htmlFor="confirmPassword">새 비밀번호 확인</label>
                        <input
                         type="password"
                         id="confirmPassword"
                         name="confirmPassword"
                         value={profileForm.confirmPassword}
                         onChange={handleProfileChange}
                      />
                     </div>
                      </>
                        )}
                    </div>
                  
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={loading}
                  >
                    {loading ? '저장 중...' : '저장'}
                  </button>
                </form>
              </div>
            )}
            
            {activeTab === 'accessibility' && (
              <div className="settings-content">
                <h2>접근성 설정</h2>
                
                <div className="settings-section">
                  <h3>글꼴 크기</h3>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="fontSize"
                        value="small"
                        checked={accessibilitySettings.fontSize === 'small'}
                        onChange={handleFontSizeChange}
                      />
                      <span>작게</span>
                    </label>
                    
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="fontSize"
                        value="medium"
                        checked={accessibilitySettings.fontSize === 'medium'}
                        onChange={handleFontSizeChange}
                      />
                      <span>중간</span>
                    </label>
                    
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="fontSize"
                        value="large"
                        checked={accessibilitySettings.fontSize === 'large'}
                        onChange={handleFontSizeChange}
                      />
                      <span>크게</span>
                    </label>

                    <div className="font-size-example">
                     <p className="small">작은 글꼴 크기 예시 (14px)</p>
                     <p className="medium">중간 글꼴 크기 예시 (16px)</p>
                     <p className="large">큰 글꼴 크기 예시 (18px)</p>
                     <p>현재 선택: <strong>{accessibilitySettings.fontSize}</strong></p>
                    </div>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h3>고대비 모드</h3>
                  <label className="switch-label">
                    <span>고대비 모드 활성화</span>
                    <div className="toggle-switch large">
                      <input
                        type="checkbox"
                        checked={accessibilitySettings.highContrast}
                        onChange={handleHighContrastChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                  <p className="setting-description">
                    화면의 대비를 높여 텍스트와 컨트롤을 더 잘 볼 수 있게 합니다.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="settings-content">
                <h2>알림 설정</h2>
                <p>알림 설정 기능은 준비 중입니다.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
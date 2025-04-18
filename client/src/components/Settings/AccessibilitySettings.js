import React, { useContext, useState } from 'react';
import { AccessibilityContext } from '../../contexts/AccessibilityContext';
import Header from '../Layout/Header';
import '../../styles/Settings.css';

const AccessibilitySettings = () => {
  const { accessibilitySettings, updateSettings } = useContext(AccessibilityContext);
  const [formData, setFormData] = useState({ ...accessibilitySettings });
  const [saved, setSaved] = useState(false);
  
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  return (
    <div className="settings-container">
      <Header />
      
      <main className="settings-content">
        <div className="settings-header">
          <h1>접근성 설정</h1>
          <p>화면 표시 방법을 조정하여 더 편리하게 사용하세요.</p>
        </div>
        
        {saved && (
          <div className="success-message">
            설정이 저장되었습니다!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-section">
            <h2>화면 표시</h2>
            
            <div className="form-group">
              <label htmlFor="highContrast">고대비 모드</label>
              <div className="toggle-wrapper">
                <input
                  type="checkbox"
                  id="highContrast"
                  name="highContrast"
                  checked={formData.highContrast}
                  onChange={handleChange}
                  className="toggle-input"
                />
                <label htmlFor="highContrast" className="toggle-label">
                  <span className="toggle-text">
                    {formData.highContrast ? '켜짐' : '꺼짐'}
                  </span>
                </label>
              </div>
              <p className="form-help">
                색상 대비를 높여 텍스트와 콘텐츠 가시성을 향상시킵니다.
              </p>
            </div>
            
            <div className="form-group">
              <label>글꼴 크기</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="fontSize"
                    value="small"
                    checked={formData.fontSize === 'small'}
                    onChange={handleChange}
                  />
                  <span>작게</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="fontSize"
                    value="medium"
                    checked={formData.fontSize === 'medium'}
                    onChange={handleChange}
                  />
                  <span>중간</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="fontSize"
                    value="large"
                    checked={formData.fontSize === 'large'}
                    onChange={handleChange}
                  />
                  <span>크게</span>
                </label>
              </div>
              <p className="form-help">
                모든 텍스트의 크기를 조정합니다.
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="enableScreenReader">화면 읽기 도구 최적화</label>
              <div className="toggle-wrapper">
                <input
                  type="checkbox"
                  id="enableScreenReader"
                  name="enableScreenReader"
                  checked={formData.enableScreenReader}
                  onChange={handleChange}
                  className="toggle-input"
                />
                <label htmlFor="enableScreenReader" className="toggle-label">
                  <span className="toggle-text">
                    {formData.enableScreenReader ? '켜짐' : '꺼짐'}
                  </span>
                </label>
              </div>
              <p className="form-help">
                화면 읽기 도구와의 호환성을 향상시킵니다.
              </p>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn">
              설정 저장
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AccessibilitySettings;
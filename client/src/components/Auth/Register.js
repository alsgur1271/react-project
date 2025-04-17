import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/auth';
import logo from '../../assets/logo.svg';
import '../../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // 실시간 유효성 검사
    if (e.target.name === 'confirmPassword') {
      if (e.target.value !== formData.password) {
        setErrors({...errors, confirmPassword: '비밀번호가 일치하지 않습니다.'});
      } else {
        const { confirmPassword, ...newErrors } = errors;
        setErrors(newErrors);
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // 사용자명 검증
    if (formData.username.length < 3) {
      newErrors.username = '사용자명은 최소 3자 이상이어야 합니다.';
    }
    
    // 이메일 검증
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력하세요.';
    }
    
    // 비밀번호 검증
    if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    
    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // 비밀번호 확인 필드 제거
      const { confirmPassword, ...registerData } = formData;
      
      await registerUser(registerData);
      setSuccess(true);
    } catch (err) {
      if (err.response?.data?.message) {
        setErrors({
          server: err.response.data.message
        });
      } else {
        setErrors({
          server: '회원가입 중 오류가 발생했습니다.'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <img src={logo} alt="TogetherOn Logo" />
            <h1>TogetherOn</h1>
          </div>
          
          <div className="success-message">
            <h2>회원가입 성공!</h2>
            <p>이메일 인증 링크를 발송했습니다.</p>
            <p>이메일을 확인하여 계정을 활성화해주세요.</p>
            <button 
              onClick={() => navigate('/login')} 
              className="auth-button"
            >
              로그인 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src={logo} alt="TogetherOn Logo" />
          <h1>TogetherOn</h1>
        </div>
        
        <h2>회원가입</h2>
        
        {errors.server && <div className="auth-error">{errors.server}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
          </div>
          
          <div className="form-group">
            <label>역할</label>
            <div className="role-selection">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                />
                <span>학생</span>
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={formData.role === 'teacher'}
                  onChange={handleChange}
                />
                <span>선생님</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
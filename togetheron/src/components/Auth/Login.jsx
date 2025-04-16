import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { loginUser } from '../../services/auth';
import VoiceRecognizer from '../../services/VoiceRecognizer';
import logo from '../../assets/logo.svg';
import '../../styles/Auth.css';

const Login = () => {

  const idInputRef = useRef(null);
  const pwInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
// src/components/Auth/Login.js 파일의 handleSubmit 함수 수정
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    const response = await loginUser(formData);
    
    // 토큰 및 사용자 정보 저장
    localStorage.setItem('token', response.token);
    setAuthState({
      isAuthenticated: true,
      user: response.user,
      loading: false
    });
    
    // 역할에 따른 리디렉션
    if (response.user.role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  } catch (err) {
    setError(err.response?.data?.message || '로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.');
    console.error('로그인 오류:', err);
  } finally {
    setLoading(false);
  }
};

const handleCommand = (text) => {
  if (text.includes('회원가입')) {
    navigate('/Signup');
  } else if (text.includes('로그인')) {
    handleSubmit();
  } else if (text.includes('아이디')) {
    idInputRef.current?.focus();
  } else if (text.includes('비밀번호')) {
    pwInputRef.current?.focus();
  } else {
    console.log('⚠️ 알 수 없는 명령:', text);
  }
};
  
  return (
    <div className="auth-container">
      <div className="auth-card">
      <div className="auth-logo">
       <img src={logo} alt="TogetherOn Logo" style={{ height: '60px', width: 'auto' }} />
      </div>
        
        <h2>로그인</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              ref={idInputRef}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              ref={pwInputRef}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>계정이 없으신가요? <Link to="/register">회원가입</Link></p>
        </div>
      </div>
      <VoiceRecognizer
        onCommandDetected={handleCommand}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
      />
    </div>
  );
};

export default Login;
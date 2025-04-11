import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VoiceRecognizer from './VoiceRecognizer';
import logo from '../assets/logo.svg'; // 로고 이미지
import '../styles/Auth.css';

const Login = () => {
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const navigate = useNavigate();
  const idInputRef = useRef(null);
  const pwInputRef = useRef(null);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/login', { id, pwd });
      if (res.status === 200 && res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/Home');
      } else {
        setError('서버 응답이 올바르지 않습니다.');
      }
    } catch (err) {
      setError('ID 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommand = (text) => {
    if (text.includes('회원가입')) {
      navigate('/Signup');
    } else if (text.includes('로그인')) {
      handleLogin();
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="auth-form"
        >
          <div className="form-group">
            <label htmlFor="id">사용자명</label>
            <input
              type="text"
              id="id"
              name="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              ref={idInputRef}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pwd">비밀번호</label>
            <input
              type="password"
              id="pwd"
              name="pwd"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              ref={pwInputRef}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            계정이 없으신가요? <Link to="/Signup">회원가입</Link>
          </p>
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

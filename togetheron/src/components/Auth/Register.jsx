import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/auth';
import VoiceRecognizer from '../../services/VoiceRecognizer';
import logo from '../../assets/logo.svg';
import '../../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    //id: '', 추가해야됨 username 변경할지 고민
    username: '',
    age: '',
    password: '',
    confirmPassword: '',
    teacherCode: '' 
  });

  const idInputRef = useRef(null);
  const pwInputRef = useRef(null);
  const pw2InputRef = useRef(null);
  const nameInputRef = useRef(null);
  const ageInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
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

  // 아이디 중복검사 부분 수정 코드 수정 필요
  {/*const checkIdUniqueness = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/check-id", { id });
      if (response.data.isUnique) {
        setIsIdUnique(true);
        alert("아이디 사용 가능합니다.");
      } else {
        setIsIdUnique(false);
        alert("아이디가 이미 존재합니다.");
      }
    } catch (error) {
      console.error("아이디 중복 확인 오류:", error);
      alert("아이디 중복 확인 실패.");
    }
  };*/}
  
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
      navigate('/login');
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
  
//음성인식
  const handleCommand = (text) => {
    if (text.includes("아이디")) {
      idInputRef.current?.focus();
    } else if (text.includes("중복 확인")) {
      checkIdUniqueness();
    } else if (text.includes("이름")) {
      nameInputRef.current.focus();
    } else if (text.includes("나이")) {
      ageInputRef.current.focus();
    } else if (text.includes("비밀번호 확인")) {
      pw2InputRef.current?.focus();
    } else if (text.includes("비밀번호")) {
      pwInputRef.current?.focus();
    } else if (text.includes("회원가입")) {
      submitButtonRef.current.click();
    } else {
      console.log("⚠️ 알 수 없는 명령:", text);
    }
  };
  
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
        {/*<div className="form-group">
            <label htmlFor="username">아이디</label>
            <div className="id-input-row">
              <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              ref={idInputRef}
              required
              />
              {<button type="button" className="check-btn" onClick={checkIdUniqueness}>중복 확인</button>(아직 작동안됨)
              {errors.id && <div className="field-error">{errors.id}</div>}
            </div>
          </div>*/}
          
          <div className="form-group">
            <label htmlFor="username">이름</label>
              <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              ref={nameInputRef}
              required
              />
              {errors.username && <div className="field-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="age">나이</label>
             <input
               type="text"
               id="age"
               name="age"
               inputMode="numeric"
               pattern="\d*"
               value={formData.age}
               onChange={(e) => {
                const value = e.target.value;
                 if (/^\d*$/.test(value)) {
                   setFormData({ ...formData, age: value });
                }
              }}
              ref={ageInputRef}
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
              ref={pw2InputRef}
              required
            />
            {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="teacherCode">선생님 인증 코드 (선택)</label>
              <input
                type="text"
                id="teacherCode"
                name="teacherCode"
                value={formData.teacherCode}
                onChange={handleChange}
                placeholder="인증 코드 입력 (선택)"
              />
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
      <VoiceRecognizer
        onCommandDetected={handleCommand}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
      />
    </div>
  );
};

export default Register;
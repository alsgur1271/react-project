import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail } from '../../services/auth';
import logo from '../../assets/logo.svg';
import '../../styles/Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token);
        setVerified(true);
      } catch (err) {
        setError(err.response?.data?.message || '인증에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    verify();
  }, [token]);
  
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <img src={logo} alt="TogetherOn Logo" />
            <h1>TogetherOn</h1>
          </div>
          <p>이메일 인증 중...</p>
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
        
        {verified ? (
          <div className="success-message">
            <h2>이메일 인증 성공!</h2>
            <p>계정이 성공적으로 활성화되었습니다.</p>
            <p>이제 로그인하여 서비스를 이용할 수 있습니다.</p>
            <Link to="/login" className="auth-button">로그인 페이지로 이동</Link>
          </div>
        ) : (
          <div className="error-message">
            <h2>인증 실패</h2>
            <p>{error}</p>
            <p>인증 링크가 만료되었거나 유효하지 않습니다.</p>
            <Link to="/login" className="auth-button">로그인 페이지로 이동</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Header.css'

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("📦 로컬스토리지 토큰:", token);

    if (token) {
      axios.get('http://localhost:5000/api/user-info', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        console.log("✅ 유저 정보 응답:", res.data);
        setIsLoggedIn(true);
        setUserName(res.data.name);
      })
      .catch(err => {
        console.error("❌ 유저 정보 불러오기 실패:", err);
        setIsLoggedIn(false);
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/Home');
  };

  return (
    <header className="home-header">
      <div className="home-logo">
        <Link to="/Home">TogetherON</Link>
      </div>

      <div className="home-search-box">
        <input type="text" placeholder="검색어를 입력하세요..." />
      </div>

      <div className="home-header-right">
        {isLoggedIn ? (
          <>
            <span className="user-info">👋 {userName}님</span>
            <Link to="/mypage" className="my-page-link">마이페이지</Link>
            <Link to="#" onClick={handleLogout} className="my-page-link">로그아웃</Link>
          </>
        ) : (
          <Link to="/" className="homelogin-button-link">로그인</Link>
        )}
      </div>
    </header>
  );
};

export default Header;

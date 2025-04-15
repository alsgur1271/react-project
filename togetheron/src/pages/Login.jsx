import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import VoiceRecognizer from "./VoiceRecognizer";
import "../styles/Login.css";

const Login = () => {
  const [id, setId] = useState(""); // 아이디 입력
  const [pwd, setPwd] = useState(""); // 비밀번호 입력
  const [error, setError] = useState(""); // 오류 메시지 상태
  const [isRecording, setIsRecording] = useState(false); // 녹음 중 여부
  const navigate = useNavigate(); // 페이지 이동
  const idInputRef = useRef(null);
  const pwInputRef = useRef(null);

  // 로그인 요청 함수
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", { id, pwd });
      if (res.status === 200 && res.data.token) {
        localStorage.setItem("token", res.data.token); // 🔐 토큰 저장!
        navigate("/Home"); // ✅ 홈으로 이동
      } else {
        setError("서버 응답이 올바르지 않습니다.");
      }
    } catch (err) {
      setError("ID 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  // 음성 녹음 시작
  const handleCommand = (text) => {
    if (text.includes("회원가입")) {
      navigate("/Signup");
    } else if (text.includes("로그인")) {
      handleLogin();
    } else if (text.includes("아이디")) {
      idInputRef.current?.focus();
    } else if (text.includes("비밀번호")) {
      pwInputRef.current?.focus();
    } else {
      console.log("⚠️ 알 수 없는 명령:", text);
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h1 className="logo">TogetherON</h1>
        <input
          type="text"
          placeholder="아이디"
          className="linput-field"
          value={id}
          onChange={(e) => setId(e.target.value)}
          ref={idInputRef}
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="linput-field"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          ref={pwInputRef}
        />
        {error && <p className="error-message">{error}</p>}
        <div className="button-group">
          <Link to="/Signup" className="signup-button-link">
            회원가입
          </Link>
          <Link to="#" onClick={handleLogin} className="login-button-link">
            로그인
          </Link>
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

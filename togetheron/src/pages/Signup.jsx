import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.svg';
import '../styles/Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const TEACHER_CODE = "TEACHER2024";

  const [id, setId] = useState('');
  const [isIdUnique, setIsIdUnique] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [hearingImpairment, setHearingImpairment] = useState(false);
  const [visualImpairment, setVisualImpairment] = useState(false);

  const handleSignup = async () => {
    if (!id) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (isIdUnique === null) {
      alert("아이디 중복확인을 해주세요.");
      return;
    }

    if (!isIdUnique) {
      alert("이미 존재하는 아이디입니다.");
      return;
    }

    if (!name || !age || !pwd || !pwdConfirm) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (pwd !== pwdConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const teacher = teacherCode === TEACHER_CODE ? 1 : 0;

    try {
      const response = await axios.post("http://localhost:5000/api/signup", {
        id,
        name,
        age: Number(age),
        pwd,
        teacher,
        hearingImpairment,
        visualImpairment,
      });

      if (response.status === 201) {
        alert("회원가입 성공!");
        navigate('/Login');
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("회원가입 실패!");
    }
  };

  const checkIdUniqueness = async () => {
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
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src={logo} alt="TogetherOn Logo" />
        </div>
        <h2>회원가입</h2>

        <div className="auth-form">
        <label>아이디</label>
          <div className="id-input-row">
            <input
              className="id-input"
              type="text"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setIsIdUnique(null); // 입력 바뀌면 중복 상태 초기화
              }}
            />
            <button type="button" className="check-btn" onClick={checkIdUniqueness}>중복 확인</button>
          </div>

          <div className="form-group">
            <label>이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>나이</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>

          <div className="form-group">
            <label>비밀번호 확인</label>
            <input type="password" value={pwdConfirm} onChange={(e) => setPwdConfirm(e.target.value)} />
          </div>

          <div className="form-group">
            <label>선생님 인증 코드 (선택)</label>
            <input type="text" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} />
          </div>

          <div className="impairment-group">
            <label>
              <input
                type="radio"
                name="impairment"
                onChange={() => {
                  setHearingImpairment(true);
                  setVisualImpairment(false);
                }}
              />
              청각 장애
            </label>
            <label>
              <input
                type="radio"
                name="impairment"
                onChange={() => {
                  setHearingImpairment(false);
                  setVisualImpairment(true);
                }}
              />
              시각 장애
            </label>
            <label>
              <input
                type="radio"
                name="impairment"
                defaultChecked
                onChange={() => {
                  setHearingImpairment(false);
                  setVisualImpairment(false);
                }}
              />
              해당 없음
            </label>
          </div>

          <button className="auth-button" onClick={handleSignup}>회원가입</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;

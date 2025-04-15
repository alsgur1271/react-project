import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VoiceRecognizer from "./VoiceRecognizer";
import '../styles/Signup.css'; 

const Signup = () => {
  const [id, setId] = useState("");     // 아이디
  const [name, setName] = useState(""); // 이름
  const [age, setAge] = useState("");   // 나이
  const [pwd, setPwd] = useState("");   // 비밀번호
  const [pwdConfirm, setPwdConfirm] = useState("");   // 비밀번호 확인
  const [hearingImpairment, setHearingImpairment] = useState(false); // 청각장애
  const [visualImpairment, setVisualImpairment] = useState(false);   // 시각장애
  const [isIdUnique, setIsIdUnique] = useState(null);   // 아이디 중복 여부
  const [isRecording, setIsRecording] = useState(false); // 녹음 상태
  const navigate = useNavigate();   // 페이지 이동
  const submitButtonRef = useRef(null); // 회원가입 버튼 참조
  const checkbtnREF = useRef(null); // 중복확인 버튼 참조조
  const idInputRef = useRef(null);
  const pwInputRef = useRef(null);
  const pw2InputRef = useRef(null);
  const nameInputRef = useRef(null);
  const ageInputRef = useRef(null);

  const handleSignup = async () => {
    // ID 입력 안하고 중복확인도 안 했을 때
    if (!id) {
      alert("아이디를 입력해주세요.");
      return;
    }
  
    // 사용자가 중복확인 안 했으면 경고
    if (isIdUnique === null) {
      alert("아이디 중복확인을 해주세요.");
      return;
    }
  
    // 중복된 아이디일 경우
    if (!isIdUnique) {
      alert("이미 존재하는 아이디입니다.");
      return;
    }
  
    if (pwd !== pwdConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/signup", { 
        id,
        name,
        age,
        pwd,
        hearingImpairment,
        visualImpairment,
      });

      if (response.status === 201) {
        navigate("/"); // 회원가입 성공 시 로그인 페이지로 이동
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
    <div className="signup-container">
      <h2>회원가입</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="ID"
          onChange={(e) => setId(e.target.value)}
          className="sinput-field"
          ref={idInputRef}
        />

        <button type="button" onClick={checkIdUniqueness} className="check-btn">
          중복확인
        </button>

      </div>
      <input
        type="text"
        placeholder="이름"
        onChange={(e) => setName(e.target.value)}
        className="sinput-field"
        ref={nameInputRef}
      />

      <input
        type="text"
        placeholder="나이"
        onChange={(e) => setAge(Number(e.target.value))}
        className="sinput-field"
        ref={ageInputRef}
      />

      <input
        type="password"
        placeholder="비밀번호"
        onChange={(e) => setPwd(e.target.value)}
        className="sinput-field"
        ref={pwInputRef}
      />

      <input
        type="password"
        placeholder="비밀번호 확인"
        onChange={(e) => setPwdConfirm(e.target.value)}
        className="sinput-field"
        ref={pw2InputRef}
      />
      
      <div className="impairment-group">
        <label>
          <input
            type="radio"
            name="impairment"
            value="hearing"
            onChange={() => setHearingImpairment(true)}
          />
          청각 장애
        </label>

        <label>
          <input
            type="radio"
            name="impairment"
            value="visual"
            onChange={() => setVisualImpairment(true)}
          />
          시각 장애
        </label>

        <label>
          <input
            type="radio"
            name="impairment"
            value="none"
            onChange={() => {
              setHearingImpairment(false);
              setVisualImpairment(false);
            }}
          />
          없음
        </label>
      </div>
      <button ref={submitButtonRef} onClick={handleSignup} className="submit-btn">회원가입</button>
      <VoiceRecognizer
        onCommandDetected={handleCommand}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        />
    </div>
  );
};

export default Signup;

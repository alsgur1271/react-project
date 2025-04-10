import React, { useState, useEffect, useRef } from "react";

const VoiceRecognitionTest = () => {
  const [text, setText] = useState(""); // 인식된 텍스트 저장
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false; // 버튼을 누르고 있을 때만 작동하도록 설정
      recognition.interimResults = false; // 중간 결과 표시 안 함
      recognition.lang = "ko-KR"; // 한국어 설정
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error("음성 인식 오류:", event.error);
      };
      
      recognitionRef.current = recognition;
    } else {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>음성 인식 테스트</h1>
      <p>버튼을 누르고 말하면 텍스트가 표시됩니다!</p>
      <button
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        🎤 누르고 말하세요
      </button>
      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", minHeight: "50px" }}>
        <strong>인식된 텍스트:</strong>
        <p>{text || "..."}</p>
      </div>
    </div>
  );
};

export default VoiceRecognitionTest;
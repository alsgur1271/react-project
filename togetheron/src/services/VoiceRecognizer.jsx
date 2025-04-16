import React, { useRef, useEffect } from "react";

const VoiceRecognizer = ({ onCommandDetected, isRecording, setIsRecording }) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        sendAudioToServer(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("🎤 마이크 접근 실패:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      const response = await fetch("http://localhost:5000/api/voice", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data && data.text) {
        const recognizedText = data.text.trim().replace(/\s+/g, ' ').toLowerCase();
        onCommandDetected(recognizedText); // 👉 부모 컴포넌트로 결과 전달
      }
    } catch (error) {
      console.error("❌ 음성 전송 실패:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2") startRecording();
    };
    const handleKeyUp = (e) => {
      if (e.key === "F2") stopRecording();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRecording]);

  return null; // UI 요소가 없을 경우 null 반환
};

export default VoiceRecognizer;

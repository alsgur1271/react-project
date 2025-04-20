import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AccessibilityContext } from '../../contexts/AccessibilityContext';
import '../../styles/VideoChat.css';
import '../../styles/WaitingRoom.css';

const StudentWaitingRoom = () => {
  const { accessibilitySettings } = useContext(AccessibilityContext);
  
  const [status, setStatus] = useState('카메라와 마이크 설정 중...');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('준비 중...');
  const [roomId] = useState('classroom-' + Math.random().toString(36).substring(2, 8));
  
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  
  const navigate = useNavigate();
  
  // 미디어 스트림 설정
  useEffect(() => {
    const setupMediaStream = async () => {
      try {
        // 카메라 및 마이크 접근
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setStatus('준비 완료! 선생님을 기다리고 있어요.');
        setIsReady(true);
      } catch (err) {
        console.error('미디어 접근 오류:', err);
        setError('카메라나 마이크를 사용할 수 없어요. 확인해주세요!');
      }
    };
    
    setupMediaStream();
    
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // 소켓 연결 및 대기
  useEffect(() => {
    if (!isReady) return;
    
    // 소켓 연결
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:8080';
    
    socketRef.current = io(serverUrl, {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });
    
    // 인증
    const token = localStorage.getItem('token');
    socketRef.current.emit('authenticate', token);
    
    // 방 생성/참여
    socketRef.current.emit('join-room', roomId);
    setConnectionStatus('선생님이 들어오기를 기다리고 있어요...');
    
    // 선생님이 들어왔을 때
    socketRef.current.on('user-connected', (userId) => {
      setConnectionStatus('선생님이 연결되었어요! 수업으로 이동합니다...');
      
      // 약간의 지연 후 화상 채팅 페이지로 이동
      setTimeout(() => {
        // URL 쿼리 파라미터로 roomId 전달
        navigate(`/student/session/custom?roomId=${roomId}`);
      }, 1500);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isReady, roomId, navigate]);
  
  // 대시보드로 돌아가기
  const goBackToDashboard = () => {
    navigate('/student/dashboard');
  };
  
  const fontSizeClass = accessibilitySettings?.fontSize || 'medium';
  const highContrastClass = accessibilitySettings?.highContrast ? 'high-contrast' : '';
  
  if (error) {
    return (
      <div className={`waiting-room-container ${fontSizeClass} ${highContrastClass}`}>
        <div className="waiting-room-content">
          <div className="error-container">
            <div className="error-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2>앗! 문제가 생겼어요</h2>
            <p>{error}</p>
            <button className="back-button" onClick={goBackToDashboard}>
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`waiting-room-container ${fontSizeClass} ${highContrastClass}`}>
      <div className="waiting-room-content">
        <div className="waiting-header">
          <h1>수업 준비 중</h1>
          <p className="waiting-status">{status}</p>
        </div>
        
        <div className="video-preview-container">
          <div className="video-preview">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
            />
            {!isReady && (
              <div className="video-loading">
                <div className="spinner"></div>
              </div>
            )}
          </div>
          <p className="preview-label">내 화면</p>
          
          <div className="connection-status">
            <div className={`status-indicator ${isReady ? 'ready' : 'connecting'}`}></div>
            <p>{connectionStatus}</p>
          </div>
        </div>
        
        <div className="waiting-info">
          <div className="room-id-display">
            <p>선생님에게 알려줄 수업 코드</p>
            <div className="room-id-box">
              <span>{roomId}</span>
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  alert('수업 코드가 복사되었어요!');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="waiting-tips">
            <h3>수업 준비 팁</h3>
            <ul>
              <li>조용한 장소에서 참여하면 선생님 목소리를 더 잘 들을 수 있어요.</li>
              <li>화면 속 자신의 모습이 잘 보이는지 확인해보세요.</li>
              <li>수업 중 궁금한 점은 언제든지 질문해도 좋아요!</li>
            </ul>
          </div>
        </div>
        
        <button className="cancel-button" onClick={goBackToDashboard}>
          취소하고 돌아가기
        </button>
      </div>
    </div>
  );
};

export default StudentWaitingRoom;
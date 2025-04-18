import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AccessibilityContext } from '../../contexts/AccessibilityContext';
import { getSessionDetails } from '../../services/api';
import '../../styles/VideoChat.css';

const TeacherVideoChat = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL에서 roomId 파라미터 확인
  const queryParams = new URLSearchParams(location.search);
  const roomIdFromQuery = queryParams.get('roomId');
  
  const { accessibilitySettings } = useContext(AccessibilityContext);
  
  // 상태
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('연결 중...');
  const [studentConnected, setStudentConnected] = useState(false);
  
  // refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const studentIdRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  
  // 세션 정보 로드
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        if (roomIdFromQuery) {
          // 직접 방 ID로 접속한 경우
          setSessionData({
            id: 'custom',
            room_id: roomIdFromQuery,
            title: '학생 초대 세션',
            status: 'active'
          });
          setLoading(false);
        } else if (sessionId && sessionId !== 'custom') {
          // 세션 ID로 접속한 경우
          try {
            const data = await getSessionDetails(sessionId);
            setSessionData(data);
          } catch (err) {
            console.error('세션 정보 로드 오류:', err);
            setSessionData({
              id: sessionId,
              room_id: sessionId,
              title: '화상 수업',
              status: 'active'
            });
          }
          setLoading(false);
        } else {
          setError('유효하지 않은 접속 방법입니다.');
          setLoading(false);
        }
      } catch (err) {
        setError('세션 정보를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    loadSessionData();
  }, [sessionId, roomIdFromQuery]);
  
  // 미디어 스트림 초기화
  const initializeMedia = async () => {
    try {
      // 기존 스트림 정리
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // 새 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('미디어 스트림 초기화됨:', stream.id);
      return stream;
    } catch (err) {
      console.error('미디어 스트림 초기화 오류:', err);
      setError('카메라 또는 마이크에 접근할 수 없습니다.');
      return null;
    }
  };
  
  // 피어 연결 생성
  const createPeerConnection = (studentId) => {
    try {
      // 기존 연결 정리
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: 'turn:togetheron.synology.me:3478',
            username: 'minju',
            credential: 'turn1234'
          }
        ]
      });
      
      // 로컬 트랙 추가
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }
      
      // 원격 트랙 수신
      pc.ontrack = (event) => {
        console.log('원격 트랙 수신됨');
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      // ICE 후보 처리
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            to: studentId,
            candidate: event.candidate
          });
        }
      };
      
      // 연결 상태 변경
      pc.oniceconnectionstatechange = () => {
        console.log('ICE 연결 상태:', pc.iceConnectionState);
        
        if (pc.iceConnectionState === 'connected') {
          setConnectionStatus('학생과 연결되었습니다.');
          setStudentConnected(true);
          
          // 연결 성공 후 3초 뒤에 미디어 스트림 재설정
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          
          restartTimeoutRef.current = setTimeout(() => {
            restartMediaStream(studentId);
          }, 3000);
        } else if (pc.iceConnectionState === 'disconnected') {
          setConnectionStatus('연결이 일시적으로 끊어졌습니다.');
        } else if (pc.iceConnectionState === 'failed') {
          setConnectionStatus('연결에 실패했습니다.');
        }
      };
      
      peerConnectionRef.current = pc;
      studentIdRef.current = studentId;
      
      return pc;
    } catch (err) {
      console.error('피어 연결 생성 오류:', err);
      return null;
    }
  };
  
  // 미디어 스트림 재시작
  const restartMediaStream = async (studentId) => {
    try {
      console.log('미디어 스트림 재시작 중...');
      setConnectionStatus('연결 품질 향상 중...');
      
      if (!peerConnectionRef.current) return;
      
      // 1. 기존 트랙 제거
      const senders = peerConnectionRef.current.getSenders();
      senders.forEach(sender => {
        peerConnectionRef.current.removeTrack(sender);
      });
      
      // 2. 기존 스트림 정리
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // 3. 새 스트림 얻기
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      
      // 4. 로컬 비디오 업데이트
      localStreamRef.current = newStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
      
      // 5. 새 트랙을 피어 연결에 추가
      newStream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, newStream);
      });
      
      // 6. 재협상 시작 (필요한 경우)
      if (studentId && socketRef.current) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        socketRef.current.emit('offer', {
          to: studentId,
          offer
        });
      }
      
      console.log('미디어 스트림 재시작 완료');
      setConnectionStatus('학생과 연결되었습니다.');
    } catch (err) {
      console.error('미디어 스트림 재시작 오류:', err);
      setConnectionStatus('미디어 재설정 실패. 정상적으로 보이지 않을 수 있습니다.');
    }
  };
  
  // 오퍼 보내기
  const sendOffer = async (studentId) => {
    try {
      if (!peerConnectionRef.current) return;
      
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      if (socketRef.current) {
        socketRef.current.emit('offer', {
          to: studentId,
          offer
        });
      }
    } catch (err) {
      console.error('Offer 생성 오류:', err);
    }
  };
  
  // WebRTC 및 소켓 설정
  useEffect(() => {
    if (loading || !sessionData) return;
    
    let isMounted = true;
    const roomId = roomIdFromQuery || sessionData.room_id;
    
    // 소켓 연결 설정
    const connectSocket = async () => {
      // 1. 미디어 초기화
      const stream = await initializeMedia();
      if (!stream) return;
      
      // 2. 소켓 연결
      const serverUrl = process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:8080';
      
      const socket = io(serverUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });
      
      socketRef.current = socket;
      
      // 3. 소켓 이벤트 리스너
      socket.on('connect', () => {
        console.log('소켓 연결됨:', socket.id);
        setConnectionStatus('서버에 연결됨. 인증 중...');
        
        // 인증 후 방 참여
        const token = localStorage.getItem('token');
        socket.emit('authenticate', token);
        
        setTimeout(() => {
          socket.emit('join-room', roomId);
          setConnectionStatus('방에 입장함. 학생 기다리는 중...');
        }, 500);
      });
      
      // 다른 사용자(학생) 연결 감지
      socket.on('user-connected', (userId) => {
        console.log('새 사용자 연결됨:', userId);
        setConnectionStatus('학생이 연결되었습니다. 연결 설정 중...');
        studentIdRef.current = userId;
        
        const pc = createPeerConnection(userId);
        sendOffer(userId);
      });
      
      socket.on('users-in-room', (userIds) => {
        console.log('방 사용자:', userIds);
        if (userIds.length > 0) {
          setConnectionStatus('학생이 이미 방에 있습니다. 연결 설정 중...');
          studentIdRef.current = userIds[0];
          
          const pc = createPeerConnection(userIds[0]);
          sendOffer(userIds[0]);
        }
      });
      
      // WebRTC 시그널링
      socket.on('offer', async (data) => {
        console.log('Offer 수신:', data.from);
        try {
          if (!peerConnectionRef.current || peerConnectionRef.current.connectionState === 'closed') {
            createPeerConnection(data.from);
          }
          
          studentIdRef.current = data.from;
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          
          socket.emit('answer', {
            to: data.from,
            answer
          });
        } catch (err) {
          console.error('Offer 처리 오류:', err);
        }
      });
      
      socket.on('answer', async (data) => {
        console.log('Answer 수신:', data.from);
        try {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        } catch (err) {
          console.error('Answer 처리 오류:', err);
        }
      });
      
      socket.on('ice-candidate', async (data) => {
        try {
          if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (err) {
          console.error('ICE Candidate 오류:', err);
        }
      });
      
      socket.on('user-disconnected', (userId) => {
        if (userId === studentIdRef.current) {
          console.log('학생 연결 해제:', userId);
          setConnectionStatus('학생이 연결을 종료했습니다.');
          setStudentConnected(false);
          studentIdRef.current = null;
          
          // 연결 정리
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
          }
        }
      });
      
      socket.on('disconnect', () => {
        console.log('서버 연결 해제');
        setConnectionStatus('서버와 연결이 끊어졌습니다. 재연결 중...');
      });
    };
    
    connectSocket();
    
    // 정리 함수
    return () => {
      isMounted = false;
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      // 미디어 스트림 정리
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      
      // 피어 연결 정리
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      // 소켓 연결 정리
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [sessionData, loading, roomIdFromQuery]);
  
  // 수업 종료
  const handleEndSession = () => {
    if (window.confirm('정말로 수업을 종료하시겠습니까?')) {
      navigate('/teacher/dashboard');
    }
  };
  
  // 수동으로 미디어 재시작
  const handleRestartMedia = () => {
    if (studentIdRef.current) {
      restartMediaStream(studentIdRef.current);
    }
  };
  
  if (loading) {
    return <div className="loading-screen">세션 정보를 불러오는 중...</div>;
  }
  
  if (error) {
    return (
      <div className="error-screen">
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/teacher/dashboard')}>
          대시보드로 돌아가기
        </button>
      </div>
    );
  }
  
  const fontSizeClass = accessibilitySettings?.fontSize || 'medium';
  const highContrastClass = accessibilitySettings?.highContrast ? 'high-contrast' : '';
  
  return (
    <div className={`video-chat-container teacher-mode ${fontSizeClass} ${highContrastClass}`}>
      <div className="video-chat-header">
        <h1>{sessionData.title || '화상 수업'}</h1>
        <div className="session-info">
          <span>참여 학생: {studentConnected ? '1명' : '0명'}</span>
          <span className="connection-status">{connectionStatus}</span>
        </div>
      </div>
      
      <div className="video-container">
        <div className="main-video">
          {studentConnected ? (
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="remote-video"
            />
          ) : (
            <div className="waiting-message">
              <p>아직 학생이 참여하지 않았습니다.</p>
              <p>학생이 참여하면 이곳에 표시됩니다.</p>
            </div>
          )}
          <div className="remote-label">학생</div>
        </div>
        
        <div className="teacher-video-container">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="teacher-video"
          />
          <div className="local-label">나 (선생님)</div>
        </div>
      </div>
      
      <div className="video-controls">
        <button className="restart-btn" onClick={handleRestartMedia}>
          영상 새로고침
        </button>
        <button className="leave-btn" onClick={handleEndSession}>
          수업 종료하기
        </button>
      </div>
    </div>
  );
};

export default TeacherVideoChat;
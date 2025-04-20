import { io } from 'socket.io-client';

// 소켓 연결 생성
export const createSocketConnection = (serverUrl = '') => {
  // 서버 URL이 제공되지 않은 경우 현재 호스트 사용
  const url = serverUrl || (
    process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5000'
  );
  
  const socket = io(url, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
    upgrade: true
  });
  
  // 연결 이벤트 처리
  socket.on('connect', () => {
    console.log('소켓 서버에 연결됨:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('소켓 연결 오류:', error.message);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('소켓 연결 해제됨:', reason);
  });
  
  return socket;
};

socketRef.current.on('disconnect', () => {
  console.log('서버와 연결이 끊어졌습니다. 재연결 시도 중...');
  // 상태 업데이트로 사용자에게 알림
  setConnectionStatus('연결이 끊어졌습니다. 재연결 중...');
});

socketRef.current.on('reconnect', (attemptNumber) => {
  console.log(`재연결 성공 (시도 ${attemptNumber})`);
  setConnectionStatus('다시 연결되었습니다');
  // 필요한 경우 세션 상태 다시 로드
});

// 사용자 인증
export const authenticateSocket = (socket, token) => {
  if (!socket || !token) return;
  socket.emit('authenticate', token);
};
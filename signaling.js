// signaling.js
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // 방 정보 저장
  const rooms = {};
  
  io.on('connection', (socket) => {
    console.log(`새 연결: ${socket.id}`);
    
    // 인증 처리
    socket.on('authenticate', (token) => {
      try {
        // 토큰 검증 (실패해도 계속 진행)
        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.id || socket.id;
        socket.username = decoded.username || '익명';
        socket.role = decoded.role || 'unknown';
      } catch (error) {
        socket.userId = socket.id;
        socket.username = '익명';
        socket.role = 'unknown';
      }
      
      console.log(`사용자 ${socket.id} (${socket.username}, ${socket.role})`);
    });
    
    // 방 입장
    socket.on('join-room', (roomId) => {
      console.log(`${socket.id} 사용자가 ${roomId} 방에 입장 요청`);
      
      // 이전에 참여한 모든 방에서 나가기
      Object.keys(socket.rooms).forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
          if (rooms[room]) {
            delete rooms[room][socket.id];
            socket.to(room).emit('user-disconnected', socket.id);
          }
        }
      });
      
      // 새 방에 참여
      socket.join(roomId);
      
      // 방 정보 초기화
      if (!rooms[roomId]) {
        rooms[roomId] = {};
      }
      
      // 방에 사용자 추가
      rooms[roomId][socket.id] = {
        id: socket.id,
        role: socket.role,
        username: socket.username
      };
      
      // 방의 다른 사용자들에게 새 사용자 알림
      socket.to(roomId).emit('user-connected', socket.id);
      
      // 새 사용자에게 방의 다른 사용자들 알림
      const usersInRoom = Object.keys(rooms[roomId]).filter(id => id !== socket.id);
      if (usersInRoom.length > 0) {
        socket.emit('users-in-room', usersInRoom);
      }
    });
    
    // WebRTC 시그널링
    socket.on('offer', (data) => {
      console.log(`offer: ${socket.id} -> ${data.to}`);
      io.to(data.to).emit('offer', {
        from: socket.id,
        offer: data.offer
      });
    });
    
    socket.on('answer', (data) => {
      console.log(`answer: ${socket.id} -> ${data.to}`);
      io.to(data.to).emit('answer', {
        from: socket.id,
        answer: data.answer
      });
    });
    
    socket.on('ice-candidate', (data) => {
      console.log(`ice-candidate: ${socket.id} -> ${data.to}`);
      io.to(data.to).emit('ice-candidate', {
        from: socket.id,
        candidate: data.candidate
      });
    });
    
    // 연결 해제
    socket.on('disconnect', () => {
      console.log(`연결 해제: ${socket.id}`);
      
      // 모든 방에서 사용자 제거
      Object.keys(rooms).forEach(roomId => {
        if (rooms[roomId] && rooms[roomId][socket.id]) {
          delete rooms[roomId][socket.id];
          
          // 방의 다른 사용자들에게 알림
          socket.to(roomId).emit('user-disconnected', socket.id);
          
          // 방이 비었으면 제거
          if (Object.keys(rooms[roomId]).length === 0) {
            delete rooms[roomId];
          }
        }
      });
    });
  });
};
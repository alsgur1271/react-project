// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const cors = require('cors');
// const helmet = require('helmet');
// const path = require('path');

// // 라우터
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const sessionRoutes = require('./routes/sessions');

// // 데이터베이스 연결
// const db = require('./config/database');

// // Express 앱 생성
// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server, {
//   cors: {
//     origin: "http://localhost:3000", // React 앱의 주소를 정확히 지정
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
//   }
// });

// // 미들웨어
// app.use(helmet());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// //cors 설정
// app.use(cors({
//     origin: "http://localhost:3000", // React 앱의 주소
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"]
//   })
// );


// // API 라우트
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/sessions', sessionRoutes);

// // 정적 파일 제공 (프로덕션 환경에서)
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'client/build')));
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
//   });
// }

// // WebRTC 시그널링 설정
// require('./signaling')(io);

// // 서버 시작
// const PORT = process.env.PORT || 8080;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
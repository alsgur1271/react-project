require('dotenv').config();  // .env 파일 로드

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer'); // 음성 파일 업로드용
const { SpeechClient } = require('@google-cloud/speech'); // Google Cloud Speech API 클라이언트
const WebSocket = require('ws');

const app = express();
const port = 5000;

// 미들웨어 설정
app.use(express.json());  // JSON 요청을 처리할 수 있도록 설정
app.use(cors({
    origin: 'http://localhost:5173', // React 클라이언트의 포트
    methods: ['GET', 'POST'],
  }));  // CORS 설정 (프론트엔드 요청 허용)

// 파일 업로드 설정 (음성 파일)
const upload = multer({ storage: multer.memoryStorage() });

// MySQL 연결 설정
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// 데이터베이스 연결
const connectDB = () => {
    db.connect((err) => {
        if (err) {
            console.error('❌ Database connection failed:', err.stack);
            setTimeout(connectDB, 5000); // 5초 후 재연결 시도
        } else {
            console.log('✅ Connected to MariaDB');
        }
    });
};
connectDB();

// 회원가입 API
app.post('/api/signup', (req, res) => {
    console.log("요청 도착!"); // ✅ 여기에 찍어야 실행됨
  console.log("받은 데이터:", req.body);
  const { id, name, age, pwd, teacher } = req.body;
  console.log("👉 받은 teacher 값:", req.body.teacher);

  if (!id || !name || !pwd) {
      return res.status(400).json({ message: "필수 입력 값이 없습니다." });
  }

  const hashedPwd = bcrypt.hashSync(pwd, 10);  // 비밀번호 해싱

  const query = 'INSERT INTO user (id, name, age, pwd, teacher) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [id, name, age || null, hashedPwd, teacher ? 1 : 0], (err, result) => {
      if (err) {
          console.error("회원가입 오류:", err); 
          return res.status(500).json({ message: 'Database error', error: err });
      }
      return res.status(201).json({ message: 'User registered successfully' });
  });
});

// 아이디 중복 체크 API
app.post('/api/check-id', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "아이디를 입력해주세요." });
  }

  const query = 'SELECT COUNT(*) AS count FROM user WHERE id = ?';
  db.query(query, [id], (err, result) => {
      if (err) {
          console.error("아이디 중복 체크 오류:", err);
          return res.status(500).json({ message: '서버 오류' });
      }

      if (result[0].count > 0) {
          return res.status(200).json({ isUnique: false, message: '이미 사용 중인 아이디입니다.' });
      } else {
          return res.status(200).json({ isUnique: true, message: '사용 가능한 아이디입니다.' });
      }
  });
});

// 로그인 API
app.post('/api/login', (req, res) => {
    const { id, pwd } = req.body;

    if (!id || !pwd) {
        return res.status(400).json({ message: 'ID와 비밀번호를 입력해주세요.' });
    }

    const query = 'SELECT * FROM user WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('❌ 로그인 오류:', err);
            return res.status(500).json({ message: '로그인 중 오류 발생' });
        }
        
        if (result.length === 0) {
            return res.status(401).json({ message: 'ID 또는 비밀번호가 올바르지 않습니다.' });
        }

        const user = result[0];

        // 비밀번호 비교
        const validPwd = bcrypt.compareSync(pwd, user.pwd);
        if (!validPwd) {
            return res.status(401).json({ message: 'ID 또는 비밀번호가 올바르지 않습니다.' });
        }

        if (!process.env.JWT_SECRET) {
            console.warn('⚠️ JWT_SECRET 환경 변수가 설정되지 않았습니다.');
        }

        // 로그인 성공 시 JWT 발급
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });

        return res.status(200).json({ message: '로그인 성공!', token });
    });
});

app.get('/api/user-info', (req, res) => {  // 유저 정보 조회 API
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      return res.status(401).json({ message: '토큰이 없습니다.' });
    }
  
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      
      const query = 'SELECT id, name FROM user WHERE id = ?';
      db.query(query, [decoded.id], (err, results) => {
        if (err) {
          console.error('DB 조회 실패:', err);
          return res.status(500).json({ message: 'DB 오류' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
  
        return res.status(200).json({ id: results[0].id, name: results[0].name });
      });
  
    } catch (error) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
  });

// 🔊 음성 인식 API (Google Cloud Speech-to-Text 사용)
const client = new SpeechClient();

// WebSocket 서버 설정 (실시간 음성 처리)
const wss = new WebSocket.Server({ port: 8080 });

app.post('/api/voice', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "음성 파일이 업로드되지 않았습니다." });
        }

        // Google Cloud Speech-to-Text API 요청
        const audioBytes = req.file.buffer.toString('base64');  // WAV 파일을 base64로 변환

        // 요청 설정
        const request = {
            audio: {
                content: audioBytes,
            },
            config: {
                encoding: 'audio/wav',       // WAV 파일에 맞는 인코딩 설정
                sampleRateHertz: 48000,     // 샘플링 레이트 설정
                languageCode: 'ko-KR',      // 한국어로 설정
            },
        };

        // 음성 인식 요청
        const [response] = await client.recognize(request);
        
        // 인식된 음성 결과를 출력
        const transcript = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        
        console.log('🎤 인식된 음성:', transcript);

        // 결과를 클라이언트에 반환
        res.json({ text: transcript });

    } catch (error) {
        console.error('❌ 음성 처리 오류:', error);
        res.status(500).json({ message: '음성 인식 실패', error: error.message });
    }
});

app.get('/api/teacher/:id', (req, res) => {
    const teacherId = req.params.id;
  
    const query = 'SELECT * FROM user WHERE id = ? AND teacher = 1';
    db.query(query, [teacherId], (err, results) => {
      if (err) {
        console.error("선생님 정보 가져오기 오류:", err);
        return res.status(500).json({ message: "DB 오류" });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: "선생님을 찾을 수 없습니다." });
      }
  
      const teacherData = {
        name: results[0].name,
        intro: "안녕하세요! 열심히 가르치는 선생님입니다 👩‍🏫", // intro는 DB에 없으면 하드코딩
        posts: [], // 나중에 자료 올리면 연결
      };
  
      res.json(teacherData);
    });
  });
  


// 서버 실행
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
//const { sendVerificationEmail } = require('../utils/emailService');
const db = require('../config/database');

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, age, password, teacherCode } = req.body;
    
    // 이미 존재하는 사용자 확인
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '이미 존재하는 사용자명입니다.' });
    }
    
    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 인증 토큰 생성
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // .env에서 teacherCode 가져오기
    const VALID_TEACHER_CODE = process.env.TEACHER_CODE || 'together123'; // .env에 설정된 코드
    
    // teacherCode가 일치하면 role을 teacher로, 아니면 student로 설정
    const role = teacherCode && teacherCode.trim() === VALID_TEACHER_CODE ? 'teacher' : 'student';

    // 사용자 저장
    const [result] = await db.query(
      'INSERT INTO users (username, age, password, role, verification_token) VALUES (?, ?, ?, ?, ?)',
      [username, age, hashedPassword, role, verificationToken]
    );
    
    // 이메일 인증 발송
    //await sendVerificationEmail(email, verificationToken);
    // 접근성 설정 생성
    await db.query(
      'INSERT INTO accessibility_settings (username) VALUES (?)',
      [result.insertId]
    );
    
    res.status(201).json({ message: '회원가입 성공. 이메일을 확인하여 계정을 활성화해주세요.' });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 이메일 인증
{/*router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const [rows] = await db.query(
      'SELECT id FROM users WHERE verification_token = ?',
      [token]
    );
    
    if (rows.length === 0) {
      return res.status(400).json({ message: '유효하지 않은 인증 토큰입니다.' });
    }
    
    await db.query(
      'UPDATE users SET verified = TRUE, verification_token = NULL WHERE id = ?',
      [rows[0].id]
    );
    
    res.status(200).json({ message: '이메일 인증 성공. 이제 로그인할 수 있습니다.' });
  } catch (error) {
    console.error('이메일 인증 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});*/}

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 사용자 확인
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      return res.status(400).json({ message: '사용자명 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    const user = rows[0];
    
    // 인증 여부 확인
    if (!user.verified) {
      return res.status(400).json({ message: '이메일 인증이 필요합니다.' });
    }
    
    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: '사용자명 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // 접근성 설정 가져오기
    const [settings] = await db.query(
      'SELECT * FROM accessibility_settings WHERE user_id = ?',
      [user.id]
    );
    
    res.status(200).json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        accessibilitySettings: settings[0] || {}
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
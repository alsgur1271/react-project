const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const auth = require('../middleware/auth');

// 사용자 프로필 가져오기
router.get('/profile', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, teacher, created_at FROM user WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('프로필 가져오기 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 비밀번호 변경
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // 현재 사용자 정보 가져오기
    const [rows] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 현재 비밀번호 확인
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    
    if (!isMatch) {
      return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }
    
    // 새 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // 비밀번호 업데이트
    await db.query(
      'UPDATE user SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );
    
    res.status(200).json({ message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 접근성 설정 가져오기
router.get('/accessibility', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT high_contrast, font_size, enable_screen_reader FROM accessibility_settings WHERE user_id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      // 설정이 없는 경우 기본값 생성
      await db.query(
        'INSERT INTO accessibility_settings (user_id) VALUES (?)',
        [req.user.id]
      );
      
      return res.status(200).json({
        highContrast: false,
        fontSize: 'medium',
        enableScreenReader: false
      });
    }
    
    // 데이터베이스 컬럼명을 JavaScript 컨벤션으로 변환
    res.status(200).json({
      highContrast: rows[0].high_contrast === 1,
      fontSize: rows[0].font_size,
      enableScreenReader: rows[0].enable_screen_reader === 1
    });
  } catch (error) {
    console.error('접근성 설정 가져오기 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 접근성 설정 업데이트
router.put('/accessibility', auth, async (req, res) => {
  try {
    const { highContrast, fontSize, enableScreenReader } = req.body;
    
    await db.query(
      'INSERT INTO accessibility_settings (user_id, high_contrast, font_size, enable_screen_reader) ' +
      'VALUES (?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE high_contrast = ?, font_size = ?, enable_screen_reader = ?',
      [
        req.user.id, 
        highContrast, 
        fontSize, 
        enableScreenReader,
        highContrast,
        fontSize,
        enableScreenReader
      ]
    );
    
    res.status(200).json({
      message: '접근성 설정이 업데이트되었습니다.',
      settings: {
        highContrast,
        fontSize,
        enableScreenReader
      }
    });
  } catch (error) {
    console.error('접근성 설정 업데이트 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
// routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const db = require('../config/database');

// 모든 라우트에 인증 미들웨어 적용
router.use(auth);
router.use(adminAuth);

// 테스트 엔드포인트
router.get('/test', (req, res) => {
  res.status(200).json({
    message: '관리자 API 접근 성공',
    user: req.user
  });
});

// 모든 선생님 목록 가져오기
router.get('/teachers', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, created_at FROM users ' +
      'WHERE role = "teacher" AND verified = 1 ORDER BY username'
    );
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('선생님 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 모든 학생 목록 가져오기
router.get('/students', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, created_at FROM users ' +
      'WHERE role = "student" AND verified = 1 ORDER BY username'
    );
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('학생 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 선생님에게 할당된 학생 목록 가져오기
router.get('/teachers/:teacherId/students', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    
    const [rows] = await db.query(
      'SELECT u.id, u.username, u.email FROM users u ' +
      'JOIN teacher_students ts ON u.id = ts.student_id ' +
      'WHERE ts.teacher_id = ? AND u.role = "student" AND u.verified = 1 ' +
      'ORDER BY u.username',
      [teacherId]
    );
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('선생님-학생 매칭 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 선생님에게 학생 할당
router.post('/teachers/:teacherId/students', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { studentIds } = req.body;
    
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ message: '유효한 학생 ID 목록이 필요합니다.' });
    }
    
    // 기존 할당 제거
    await db.query(
      'DELETE FROM teacher_students WHERE teacher_id = ?',
      [teacherId]
    );
    
    // 새 할당 추가
    if (studentIds.length > 0) {
      for (const studentId of studentIds) {
        await db.query(
          'INSERT INTO teacher_students (teacher_id, student_id) VALUES (?, ?)',
          [teacherId, studentId]
        );
      }
    }
    
    res.status(200).json({ message: '학생 할당이 완료되었습니다.' });
  } catch (error) {
    console.error('학생 할당 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;


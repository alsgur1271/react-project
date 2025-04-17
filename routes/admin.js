const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const db = require('../config/database');

// 관리자 권한 확인 미들웨어
router.use(auth);
router.use(adminAuth);

// 모든 사용자 목록 가져오기
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE email_verified != 2 ORDER BY created_at DESC'
    );
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 선생님 목록 가져오기
router.get('/teachers', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE role = "teacher" AND email_verified = 1 ORDER BY username'
    );
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('선생님 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 학생 목록 가져오기
router.get('/students', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE role = "student" AND email_verified = 1 ORDER BY username'
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
      'WHERE ts.teacher_id = ? AND u.role = "student" AND u.email_verified = 1 ' +
      'ORDER BY u.username',
      [teacherId]
    );
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('선생님 학생 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 선생님에게 학생 할당
router.post('/teachers/:teacherId/students', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { studentIds } = req.body;
    
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: '유효한 학생 ID 목록이 필요합니다.' });
    }
    
    // 선생님 존재 확인
    const [teachers] = await db.query(
      'SELECT id FROM users WHERE id = ? AND role = "teacher" AND email_verified = 1',
      [teacherId]
    );
    
    if (teachers.length === 0) {
      return res.status(404).json({ message: '유효한 선생님이 아닙니다.' });
    }
    
    // 기존 할당된 학생들 제거
    await db.query(
      'DELETE FROM teacher_students WHERE teacher_id = ?',
      [teacherId]
    );
    
    // 새로운 학생들 할당
    for (const studentId of studentIds) {
      await db.query(
        'INSERT INTO teacher_students (teacher_id, student_id) VALUES (?, ?)',
        [teacherId, studentId]
      );
    }
    
    res.status(200).json({ message: '학생 할당이 완료되었습니다.' });
  } catch (error) {
    console.error('학생 할당 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
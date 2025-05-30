const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 필요한 모델 불러오기
const db = require('../config/database');

// 수업 생성
router.post('/', auth, async (req, res) => {
  try {
    // 선생님 권한 확인
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: '선생님만 수업을 생성할 수 있습니다.' });
    }
    
    const { title, description, scheduledStart, scheduledEnd, studentIds } = req.body;
    
    // 방 ID 생성 (랜덤)
    const roomId = 'class-' + Math.random().toString(36).substring(2, 10);
    
    // 데이터베이스에 세션 추가
    const [result] = await db.query(
      'INSERT INTO sessions (title, description, teacher_id, scheduled_start, scheduled_end, room_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, req.user.id, scheduledStart, scheduledEnd, roomId, 'scheduled']
    );
    
    const sessionId = result.insertId;
    
    // 학생 할당 (있는 경우)
    if (studentIds && studentIds.length > 0) {
      for (const studentId of studentIds) {
        await db.query(
          'INSERT INTO session_participants (session_id, user_id) VALUES (?, ?)',
          [sessionId, studentId]
        );
      }
    }
    
    res.status(201).json({
      message: '수업이 성공적으로 생성되었습니다.',
      sessionId,
      roomId
    });
  } catch (error) {
    console.error('수업 생성 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 선생님의 수업 목록 가져오기
router.get('/teacher', auth, async (req, res) => {
  try {
    // 선생님 권한 확인
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const [rows] = await db.query(
      'SELECT s.*, ' +
      '(SELECT COUNT(*) FROM session_participants WHERE session_id = s.id) as student_count ' +
      'FROM sessions s ' +
      'WHERE s.teacher_id = ? ' +
      'ORDER BY s.scheduled_start DESC',
      [req.user.id]
    );
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('수업 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 학생의 예정된 수업 목록 가져오기
router.get('/upcoming', auth, async (req, res) => {
  try {
    // 학생 권한 확인
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const [rows] = await db.query(
      'SELECT s.*, u.username as teacher_name ' +
      'FROM sessions s ' +
      'JOIN users u ON s.teacher_id = u.id ' +
      'JOIN session_participants sp ON s.id = sp.session_id ' +
      'WHERE sp.user_id = ? AND s.scheduled_start > NOW() ' +
      'ORDER BY s.scheduled_start ASC',
      [req.user.id]
    );
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('예정된 수업 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 현재 활성화된 수업 목록 가져오기
router.get('/active', auth, async (req, res) => {
  try {
    const now = new Date();
    
    if (req.user.role === 'student') {
      // 학생인 경우 참여 중인 활성화된 수업 가져오기
      const [rows] = await db.query(
        'SELECT s.*, u.username as teacher_name ' +
        'FROM sessions s ' +
        'JOIN users u ON s.teacher_id = u.id ' +
        'JOIN session_participants sp ON s.id = sp.session_id ' +
        'WHERE sp.user_id = ? AND s.status = "active" ' +
        'AND s.scheduled_start <= ? AND s.scheduled_end >= ? ' +
        'LIMIT 1',
        [req.user.id, now, now]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ message: '활성화된 수업이 없습니다.' });
      }
      
      res.status(200).json(rows[0]);
    } else if (req.user.role === 'teacher') {
      // 선생님인 경우 자신이 생성한 활성화된 수업 가져오기
      const [rows] = await db.query(
        'SELECT s.*, ' +
        '(SELECT COUNT(*) FROM session_participants WHERE session_id = s.id) as student_count ' +
        'FROM sessions s ' +
        'WHERE s.teacher_id = ? AND s.status = "active" ' +
        'AND s.scheduled_start <= ? AND s.scheduled_end >= ? ' +
        'LIMIT 1',
        [req.user.id, now, now]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ message: '활성화된 수업이 없습니다.' });
      }
      
      res.status(200).json(rows[0]);
    } else {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
  } catch (error) {
    console.error('활성화된 수업 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 수업 세부 정보 가져오기
router.get('/:id', auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    // 수업 정보 가져오기
    const [rows] = await db.query(
      'SELECT s.*, u.username as teacher_name ' +
      'FROM sessions s ' +
      'JOIN users u ON s.teacher_id = u.id ' +
      'WHERE s.id = ?',
      [sessionId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '수업을 찾을 수 없습니다.' });
    }
    
    const session = rows[0];
    
    // 권한 확인 (선생님 또는 참여 학생만 접근 가능)
    if (req.user.role === 'teacher' && req.user.id !== session.teacher_id) {
      return res.status(403).json({ message: '이 수업에 접근할 권한이 없습니다.' });
    } else if (req.user.role === 'student') {
      const [participants] = await db.query(
        'SELECT * FROM session_participants WHERE session_id = ? AND user_id = ?',
        [sessionId, req.user.id]
      );
      
      if (participants.length === 0) {
        return res.status(403).json({ message: '이 수업에 접근할 권한이 없습니다.' });
      }
    }
    
    res.status(200).json(session);
  } catch (error) {
    console.error('수업 세부 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 수업 시작
router.post('/:id/start', auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    // 수업 정보 가져오기
    const [rows] = await db.query(
      'SELECT * FROM sessions WHERE id = ?',
      [sessionId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '수업을 찾을 수 없습니다.' });
    }
    
    const session = rows[0];
    
    // 권한 확인 (선생님만 시작 가능)
    if (req.user.role !== 'teacher' || req.user.id !== session.teacher_id) {
      return res.status(403).json({ message: '이 수업을 시작할 권한이 없습니다.' });
    }
    
    // 수업 상태 업데이트
    await db.query(
      'UPDATE sessions SET status = "active" WHERE id = ?',
      [sessionId]
    );
    
    res.status(200).json({
      message: '수업이 시작되었습니다.',
      sessionId,
      roomId: session.room_id
    });
  } catch (error) {
    console.error('수업 시작 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 수업 종료
router.post('/:id/end', auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    // 수업 정보 가져오기
    const [rows] = await db.query(
      'SELECT * FROM sessions WHERE id = ?',
      [sessionId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '수업을 찾을 수 없습니다.' });
    }
    
    const session = rows[0];
    
    // 권한 확인 (선생님만 종료 가능)
    if (req.user.role !== 'teacher' || req.user.id !== session.teacher_id) {
      return res.status(403).json({ message: '이 수업을 종료할 권한이 없습니다.' });
    }
    
    // 수업 상태 업데이트
    await db.query(
      'UPDATE sessions SET status = "completed" WHERE id = ?',
      [sessionId]
    );
    
    res.status(200).json({
      message: '수업이 종료되었습니다.',
      sessionId
    });
  } catch (error) {
    console.error('수업 종료 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
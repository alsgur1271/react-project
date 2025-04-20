// src/components/Dashboard/EditSession.js
import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  getSessionDetails, 
  getSessionParticipants, 
  updateSession, 
  fetchMyStudents 
} from '../../services/api';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import Footer from '../Layout/Footer'
import '../../styles/Dashboard.css';
import '../../styles/CreateSession.css';

const EditSession = () => {
  const { sessionId } = useParams();
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStart: '',
    scheduledEnd: '',
    studentIds: []
  });
  
  const [sessionStatus, setSessionStatus] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // 현재 날짜와 시간을 YYYY-MM-DDTHH:MM 형식으로 변환
  const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
  };
  
  // 종료 시간은 시작 시간으로부터 1시간 후로 설정
  const getEndDateTime = (startDateTime) => {
    if (!startDateTime) return '';
    const end = new Date(startDateTime);
    end.setHours(end.getHours() + 1);
    return end.toISOString().slice(0, 16);
  };
  
  // 세션 정보 및 참가자 불러오기
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true);
        
        // 세션 상세 정보 가져오기
        const sessionData = await getSessionDetails(sessionId);
        
        // 세션 참가자 정보 가져오기
        const participants = await getSessionParticipants(sessionId);
        
        // 폼 데이터 설정
        setFormData({
          title: sessionData.title || '',
          description: sessionData.description || '',
          scheduledStart: formatDateTimeForInput(sessionData.scheduled_start),
          scheduledEnd: formatDateTimeForInput(sessionData.scheduled_end),
          studentIds: participants.map(p => p.id)
        });
        
        setSessionStatus(sessionData.status);
        setSelectedStudents(participants);
        
        // 선생님의 학생 목록 가져오기
        const availableStudents = await fetchMyStudents();
        setStudents(availableStudents);
        
        setError(null);
      } catch (err) {
        console.error('세션 데이터 로드 오류:', err);
        setError('수업 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSessionData();
  }, [sessionId]);
  
  // 폼 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'scheduledStart') {
      setFormData({
        ...formData,
        scheduledStart: value,
        scheduledEnd: getEndDateTime(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // 학생 선택 처리
  const handleStudentSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => ({
      id: parseInt(option.value),
      name: option.text
    }));
    
    setSelectedStudents(selectedOptions);
    setFormData({
      ...formData,
      studentIds: selectedOptions.map(student => student.id)
    });
  };
  
  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // 이미 완료된 수업은 수정 불가
      if (sessionStatus === 'completed') {
        setError('이미 완료된 수업은 수정할 수 없습니다.');
        setSaving(false);
        return;
      }
      
      await updateSession(sessionId, formData);
      alert('수업이 성공적으로 수정되었습니다!');
      navigate('/teacher/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || '수업 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="loading-screen">수업 정보를 불러오는 중...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <Sidebar />
        
        <main className="main-content">
          <div className="section-header">
            <h1>수업 수정</h1>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="create-session-card">
            <form onSubmit={handleSubmit} className="create-session-form">
              <div className="form-group">
                <label htmlFor="title">수업 제목</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={sessionStatus === 'completed'}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">수업 설명</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  disabled={sessionStatus === 'completed'}
                ></textarea>
              </div>
              
<div className="form-row">
  <div className="form-group">
    <label htmlFor="scheduledStart">시작 시간</label>
    <input
      type="datetime-local"
      id="scheduledStart"
      name="scheduledStart"
      value={formData.scheduledStart}
      onChange={handleChange}
      required
      disabled={sessionStatus === 'completed'} // 활성 상태 제약 제거
    />
  </div>
  
  <div className="form-group">
    <label htmlFor="scheduledEnd">종료 시간</label>
    <input
      type="datetime-local"
      id="scheduledEnd"
      name="scheduledEnd"
      value={formData.scheduledEnd}
      onChange={handleChange}
      required
      disabled={sessionStatus === 'completed'} // 활성 상태 제약 제거
    />
  </div>
</div>

<div className="form-group">
  <label htmlFor="students">참여 학생 선택</label>
  <select
    id="students"
    multiple
    size="5"
    onChange={handleStudentSelect}
    className="student-select"
    disabled={sessionStatus === 'completed'} // 활성 상태 제약 제거
    value={selectedStudents.map(s => s.id.toString())}
  >
    {students.map(student => (
      <option key={student.id} value={student.id}>
        {student.username}
      </option>
    ))}
  </select>
  
  <div className="selected-students">
    <p>선택된 학생: {selectedStudents.length}명</p>
    <ul>
      {selectedStudents.map(student => (
        <li key={student.id}>{student.name || student.username}</li>
      ))}
    </ul>
  </div>
</div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => navigate('/teacher/dashboard')}
                >
                  취소
                </button>
                
                <button 
                  type="submit" 
                  className="create-btn"
                  disabled={saving || sessionStatus === 'completed'}
                >
                  {saving ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EditSession;
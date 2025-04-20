// src/components/Dashboard/CreateSession.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { createSession, fetchMyStudents, fetchStudentList } from '../../services/api';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import '../../styles/Dashboard.css';
import '../../styles/CreateSession.css';

const CreateSession = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStart: '',
    scheduledEnd: '',
    studentIds: []
  });
  
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState(null);
  
  // 현재 날짜와 시간을 YYYY-MM-DDTHH:MM 형식으로 가져오기
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // 5분 후로 설정
    return now.toISOString().slice(0, 16);
  };
  
  // 종료 시간은 시작 시간으로부터 1시간 후로 설정
  const getEndDateTime = (startDateTime) => {
    if (!startDateTime) return '';
    const end = new Date(startDateTime);
    end.setHours(end.getHours() + 1);
    return end.toISOString().slice(0, 16);
  };
  
  useEffect(() => {
    // 학생 목록 가져오기
    const loadStudents = async () => {
      setLoadingStudents(true);
      setError(null);
      
      try {
        console.log('학생 목록 가져오기 시도...');
        
        // 먼저 선생님에게 할당된 학생 목록 가져오기
        let studentList = [];
        
        try {
          studentList = await fetchMyStudents();
          console.log('할당된 학생 목록 가져오기 성공:', studentList);
        } catch (err) {
          console.error('할당된 학생 목록 로드 오류:', err);
          
          // 할당된 학생 로드 실패 시 모든 학생 목록 가져오기 시도
          try {
            studentList = await fetchStudentList();
            console.log('모든 학생 목록 가져오기 성공:', studentList);
          } catch (fallbackErr) {
            console.error('모든 학생 목록 로드 오류:', fallbackErr);
            throw fallbackErr;
          }
        }
        
        // 학생 목록이 없거나 빈 배열인 경우 체크
        if (!studentList || !Array.isArray(studentList)) {
          console.warn('응답은 성공했지만 학생 목록이 유효하지 않음:', studentList);
          studentList = [];
        }
        
        setStudents(studentList);
      } catch (err) {
        console.error('학생 목록 로드 최종 오류:', err);
        setError('학생 목록을 불러오는데 실패했습니다.');
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    
    loadStudents();
    
    // 기본값 설정
    setFormData({
      ...formData,
      scheduledStart: getCurrentDateTime(),
      scheduledEnd: getEndDateTime(getCurrentDateTime())
    });
  }, []);
  
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
    setLoading(true);
    setError(null);
    
    try {
      // 폼 데이터 유효성 검사
      if (!formData.title.trim()) {
        throw new Error('수업 제목을 입력해주세요.');
      }
      
      console.log('수업 생성 요청 데이터:', formData);
      const result = await createSession(formData);
      console.log('수업 생성 응답:', result);
      
      alert('수업이 성공적으로 생성되었습니다!');
      navigate('/teacher/dashboard');
    } catch (err) {
      console.error('수업 생성 오류:', err);
      setError(err.message || '수업 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 간단한 테스트를 위해 즉시 시작 버튼 추가
  const handleStartNow = async () => {
    if (formData.title.trim() === '') {
      setError('수업 제목을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1) 현재 시간으로 설정된 세션 데이터
      const sessionData = {
        title: formData.title,
        description: formData.description,
        scheduledStart: new Date().toISOString(),
        scheduledEnd: getEndDateTime(new Date().toISOString()),
        studentIds: formData.studentIds
      };
      
      console.log('즉시 시작 요청 데이터:', sessionData);
      
      // 2) 세션 생성
      const result = await createSession(sessionData);
      console.log('세션 생성 응답:', result);
      
      // 3) 바로 세션 시작
      if (result.sessionId) {
        navigate(`/teacher/session/${result.sessionId}`);
      }
    } catch (err) {
      console.error('즉시 수업 시작 오류:', err);
      setError(err.message || '수업 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <Sidebar />
        
        <main className="main-content">
          <div className="section-header">
            <h1>새 수업 만들기</h1>
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
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="students">참여 학생 선택</label>
                {loadingStudents ? (
                  <div className="loading-students">학생 목록을 불러오는 중...</div>
                ) : students.length > 0 ? (
                  <>
                    <select
                      id="students"
                      multiple
                      size="5"
                      onChange={handleStudentSelect}
                      className="student-select"
                    >
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.username}
                        </option>
                      ))}
                    </select>
                    
                    <div className="selected-students">
                      <p>선택된 학생: {selectedStudents.length}명</p>
                      {selectedStudents.length > 0 ? (
                        <ul>
                          {selectedStudents.map(student => (
                            <li key={student.id}>{student.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty-selection">학생을 선택해주세요</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="no-students-message">
                    <p>할당된 학생이 없습니다.</p>
                    <p>관리자에게 학생 할당을 요청하세요.</p>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="start-now-btn"
                  onClick={handleStartNow}
                  disabled={loading || formData.title === '' || selectedStudents.length === 0}
                >
                  {loading ? '처리 중...' : '바로 시작하기'}
                </button>
                
                <div>
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
                    disabled={loading || formData.title === '' || selectedStudents.length === 0}
                  >
                    {loading ? '생성 중...' : '수업 생성'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateSession;
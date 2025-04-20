import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchTeacherSessions, startSession, deleteSession } from '../../services/api';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import Footer from '../Layout/Footer'
import '../../styles/Dashboard.css';

const TeacherDashboard = () => {
  const { authState } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingSession, setStartingSession] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // 수업 목록 가져오기
        const data = await fetchTeacherSessions();
        setSessions(data || []);
        
        // 활성화된 수업이 있는지 확인
        const activeSession = data.find(session => session.status === 'active');
        if (activeSession) {
          setActiveSession(activeSession);
        }
        
        setError(null);
      } catch (err) {
        console.error('세션 가져오기 오류:', err);
        setError('수업 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
    
    // 30초마다 수업 목록 새로고침
    const intervalId = setInterval(fetchSessions, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleStartSession = async (sessionId) => {
    setStartingSession(sessionId);
    try {
      const result = await startSession(sessionId);
      navigate(`/teacher/session/${sessionId}`);
    } catch (err) {
      alert('세션 시작 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
    } finally {
      setStartingSession(null);
    }
  };
  
  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '진행 중';
      case 'scheduled': return '예정됨';
      case 'completed': return '완료됨';
      default: return status;
    }
  };

// 수업 수정 핸들러
const handleEditSession = (sessionId) => {
  // 수정 페이지로 이동
  navigate(`/teacher/edit-session/${sessionId}`);
};

// 수업 삭제 핸들러
const handleDeleteSession = async (sessionId) => {
  // 활성 상태 확인
  const session = sessions.find(s => s.id === sessionId);
  const isActive = session && session.status === 'active';
  
  // 활성 상태인 경우 추가 경고
  let confirmMessage = '정말로 이 수업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.';
  if (isActive) {
    confirmMessage = '⚠️ 경고: 현재 진행 중인 수업입니다! 삭제하면 모든 연결이 끊어집니다. 정말로 삭제하시겠습니까?';
  }
  
  if (window.confirm(confirmMessage)) {
    try {
      await deleteSession(sessionId);
      
      // 성공 시 목록에서 해당 수업 제거
      setSessions(sessions.filter(session => session.id !== sessionId));
      
      // 성공 메시지 표시
      alert('수업이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('수업 삭제 오류:', err);
      alert('수업 삭제 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
    }
  }
};
  
  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <Sidebar />
        
        <main className="main-content">
          <div className="welcome-section">
            <h1>안녕하세요, {authState.user?.username || '선생님'}!</h1>
            <p>오늘의 수업을 확인하고 관리하세요.</p>
          </div>
          
          {activeSession && (
            <div className="active-session-alert teacher">
              <div className="alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="alert-content">
                <h3>진행 중인 수업이 있습니다!</h3>
                <p>"{activeSession.title}" 수업이 현재 진행 중입니다.</p>
                <button 
                  className="continue-session-btn"
                  onClick={() => navigate(`/teacher/session/${activeSession.id}`)}
                >
                  수업 이어가기
                </button>
              </div>
            </div>
          )}
          
          <div className="dashboard-actions">
            <Link to="/teacher/create-session" className="action-button create">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              새 수업 만들기
            </Link>
          </div>
          
          <section className="dashboard-section">
            <h2>내 수업 목록</h2>
            
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <span>수업 정보를 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : sessions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <p>아직 등록된 수업이 없습니다.</p>
                <p>'새 수업 만들기'를 클릭하여 첫 수업을 만들어보세요!</p>
              </div>
            ) : (
              <div className="sessions-list">
                {sessions.map(session => (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
    <h3>{session.title}</h3>
    <span className={`session-status ${getStatusClass(session.status)}`}>
      {getStatusText(session.status)}
    </span>
  </div>
  
  <div className="session-info">
    <div className="info-row">
      <span className="info-label">일정:</span>
      <span>{getFormattedDate(session.scheduled_start)} ~ {getFormattedDate(session.scheduled_end)}</span>
    </div>
    <div className="info-row">
      <span className="info-label">참가 학생:</span>
      <span>{session.student_count || 0}명</span>
    </div>
    {session.description && (
      <div className="session-description">
        {session.description}
      </div>
    )}
  </div>
  
<div className="session-actions">
  {session.status === 'active' ? (
    <>
      <button 
        onClick={() => navigate(`/teacher/session/${session.id}`)}
        className="btn-success"
      >
        수업 입장
      </button>
      <button
        onClick={() => handleEditSession(session.id)}
        className="btn-secondary"
      >
        수정
      </button>
      <button
        onClick={() => handleDeleteSession(session.id)}
        className="btn-danger"
      >
        삭제
      </button>
    </>
  ) : session.status === 'scheduled' ? (
    <>
      <button 
        onClick={() => handleStartSession(session.id)}
        className="btn-primary"
        disabled={startingSession === session.id}
      >
        {startingSession === session.id ? '시작 중...' : '수업 시작'}
      </button>
      <button
        onClick={() => handleEditSession(session.id)}
        className="btn-secondary"
      >
        수정
      </button>
      <button
        onClick={() => handleDeleteSession(session.id)}
        className="btn-danger"
      >
        삭제
      </button>
    </>
  ) : (
    <div className="completed-actions">
      <span className="completed-label">종료된 수업</span>
      <button
        onClick={() => handleDeleteSession(session.id)}
        className="btn-danger"
      >
        삭제
      </button>
    </div>
  )}
</div>

                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
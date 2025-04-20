import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchUpcomingSessions, fetchActiveSession } from '../../services/api';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import Footer from '../Layout/Footer'
import '../../styles/Dashboard.css';

const StudentDashboard = () => {
  const { authState } = useContext(AuthContext);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joiningClass, setJoiningClass] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 예정된 수업 가져오기
        const sessions = await fetchUpcomingSessions().catch(() => []);
        setUpcomingSessions(sessions || []);
        
        // 현재 활성화된 수업 확인
        try {
          const active = await fetchActiveSession();
          setActiveSession(active);
        } catch (err) {
          // 활성화된 수업이 없으면 404 에러가 발생함 (정상)
          if (err.response && err.response.status !== 404) {
            console.error('활성 세션 가져오기 오류:', err);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('데이터 가져오기 오류:', err);
        setError('수업 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // 30초마다 데이터 새로고침
    const intervalId = setInterval(loadData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // 특정 수업 참여
  const joinSession = (sessionId) => {
    setJoiningClass(true);
    navigate(`/student/session/${sessionId}`);
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
  
  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <Sidebar />
        
        <main className="main-content">
          <div className="welcome-section">
            <h1>안녕하세요, {authState.user?.username || '학생'}님!</h1>
            <p>오늘의 수업 일정을 확인하고 참여하세요.</p>
          </div>
          
          {activeSession && (
            <div className="active-session-alert student">
              <div className="alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="alert-content">
                <h3>진행 중인 수업이 있습니다!</h3>
                <p>{activeSession.teacher_name} 선생님의 "{activeSession.title}" 수업이 지금 진행 중이에요.</p>
                <button 
                  className="join-active-session-btn"
                  onClick={() => joinSession(activeSession.id)}
                  disabled={joiningClass}
                >
                  {joiningClass ? '참여 중...' : '지금 참여하기'}
                </button>
              </div>
            </div>
          )}
          
          <section className="dashboard-section">
            <h2>예정된 수업</h2>
            
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <span>수업 정보를 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : upcomingSessions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <p>예정된 수업이 없습니다.</p>
                <p>선생님이 새 수업을 등록하면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="sessions-list">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
                      <h3>{session.title}</h3>
                      <span className={`session-status ${getStatusClass(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                    </div>
                    
                    <div className="session-info">
                      <div className="info-row">
                        <span className="info-label">선생님:</span>
                        <span>{session.teacher_name}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">일정:</span>
                        <span>{getFormattedDate(session.scheduled_start)} ~ {getFormattedDate(session.scheduled_end)}</span>
                      </div>
                      {session.description && (
                        <div className="session-description">
                          {session.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="session-actions">
                      {session.status === 'active' ? (
                        <button 
                          onClick={() => joinSession(session.id)}
                          className="btn-success"
                          disabled={joiningClass}
                        >
                          {joiningClass ? '참여 중...' : '지금 참여하기'}
                        </button>
                      ) : session.status === 'scheduled' ? (
                        <button disabled className="btn-disabled">
                          아직 시작 전
                        </button>
                      ) : (
                        <button disabled className="btn-disabled">
                          종료된 수업
                        </button>
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

export default StudentDashboard;
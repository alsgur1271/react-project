import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import Footer from '../Layout/Footer'
import '../../styles/Dashboard.css';
import '../../styles/TeacherJoinRoom.css';

const TeacherJoinRoom = () => {
  const { authState } = useContext(AuthContext);
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  
  const navigate = useNavigate();
  
  const handleJoinRoom = (e) => {
    e.preventDefault();
    
    if (!roomId.trim()) {
      setError('수업 코드를 입력해주세요.');
      return;
    }
    
    setJoining(true);
    
    // 학생의 방에 참여
    setTimeout(() => {
      navigate(`/teacher/session/custom?roomId=${roomId}`);
    }, 1000);
  };
  
  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <Sidebar />
        
        <main className="main-content">
          <div className="section-header">
            <h1>학생 수업에 참여하기</h1>
          </div>
          
          <div className="join-room-card">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </div>
            
            <h2>학생이 준비한 수업에 참여해요</h2>
            <p>학생이 알려준 수업 코드를 입력하여 참여하세요.</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleJoinRoom} className="join-form">
              <div className="input-group">
                <label htmlFor="roomId">수업 코드</label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="예: classroom-abc123"
                  disabled={joining}
                />
              </div>
              
              <button 
                type="submit" 
                className={`join-button ${joining ? 'loading' : ''}`}
                disabled={joining}
              >
                {joining ? (
                  <>
                    <span className="loading-spinner"></span>
                    참여 중...
                  </>
                ) : '수업 참여하기'}
              </button>
            </form>
            
            <div className="join-info">
              <h3>수업 참여 방법</h3>
              <ol>
                <li>학생에게 수업 코드를 알려달라고 요청하세요.</li>
                <li>위 입력창에 코드를 입력하고 '수업 참여하기' 버튼을 클릭하세요.</li>
                <li>카메라와 마이크 사용 권한을 허용하세요.</li>
                <li>학생과의 화상 수업이 자동으로 시작됩니다.</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherJoinRoom;
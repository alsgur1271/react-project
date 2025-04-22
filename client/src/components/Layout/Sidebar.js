import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/Sidebar.css';

const Sidebar = () => {
  const { authState } = useContext(AuthContext);
  
  const isTeacher = authState.user?.role === 'teacher';
  
  // 사용자 아바타를 위한 랜덤 파스텔 색상 생성 (옵션)
  const getUserColor = (username) => {
    const colors = [
      '#4dabf7', '#339af0', '#74c0fc', '#a5d8ff', 
      '#15aabf', '#22b8cf', '#3bc9db', '#66d9e8'
    ];
    // 이름 기반으로 일관된 색상 선택
    const index = username?.length ? username.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };
  
  // 사용자 이름 출력 형식 개선
  const formatName = (username) => {
    if (!username) return '';
    // 이름이 길면 짧게 표시
    return username.length > 15 ? `${username.substring(0, 12)}...` : username;
  };
  
  const avatarStyle = {
    backgroundColor: getUserColor(authState.user?.username)
  };
  
  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="user-avatar" style={avatarStyle}>
          {authState.user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h3>{formatName(authState.user?.username)}</h3>
          <p>{isTeacher ? '선생님' : '학생'}</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to={`/${authState.user?.role}/dashboard`} 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <i className="fas fa-home"></i>
          <span>대시보드</span>
        </NavLink>
        
        {/* 나머지 메뉴 항목들은 동일합니다 */}
        <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <i className="fas fa-user"></i>
          <span>내 프로필</span>
        </NavLink>
        
        {isTeacher ? (
          <>
            <NavLink 
              to="/teacher/sessions" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              <span>내 수업</span>
            </NavLink>
            
            <NavLink 
              to="/teacher/create-session" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-plus-circle"></i>
              <span>수업 만들기</span>
            </NavLink>
            
            <NavLink 
              to="/teacher/students" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-user-graduate"></i>
              <span>학생 관리</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink 
              to="/student/schedule" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-calendar-alt"></i>
              <span>내 수업 일정</span>
            </NavLink>
            
            <NavLink 
              to="/student/materials" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-book"></i>
              <span>학습 자료</span>
            </NavLink>
          </>
        )}
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <i className="fas fa-cog"></i>
          <span>설정</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
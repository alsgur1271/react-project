import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Sidebar.css'
const Sidebar = () => {
  const { authState } = useContext(AuthContext);
  
  const isTeacher = authState.user?.role === 'teacher';
  
  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="user-avatar">
          {/* 사용자 이니셜 표시 */}
          {authState.user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h3>{authState.user?.username}</h3>
          <p>{isTeacher ? '선생님' : '학생'}</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to={`/${authState.user?.role}/dashboard`} 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <i className="fas fa-home"></i>
          대시보드
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <i className="fas fa-user"></i>
          내 프로필
        </NavLink>
        
        {isTeacher ? (
          <>
            <NavLink 
              to="/teacher/sessions" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              내 수업
            </NavLink>
            
            <NavLink 
              to="/teacher/create-session" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-plus-circle"></i>
              수업 만들기
            </NavLink>
            
            <NavLink 
              to="/teacher/students" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-user-graduate"></i>
              학생 관리
            </NavLink>
          </>
        ) : (
          <>
            <NavLink 
              to="/student/schedule" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-calendar-alt"></i>
              내 수업 일정
            </NavLink>
            
            <NavLink 
              to="/student/materials" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className="fas fa-book"></i>
              학습 자료
            </NavLink>
          </>
        )}
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <i className="fas fa-cog"></i>
          설정
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
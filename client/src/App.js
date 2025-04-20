import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';

// 컴포넌트 임포트
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import StudentVideoChat from './components/VideoChat/StudentVideoChat';
import TeacherVideoChat from './components/VideoChat/TeacherVideoChat';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import CreateSession from './components/Dashboard/CreateSession';
import AccessibilitySettings from './components/Settings/AccessibilitySettings';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Settings from './components/Settings/Settings';
import EditSession from './components/Dashboard/EditSession';

import './styles/App.css';


function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <div className="app-container">
            <main className="app-main">
              <Routes>
                {/* 공개 라우트 */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify/:token" element={<VerifyEmail />} />
                
                {/* 인증 필요 라우트 */}
                <Route element={<PrivateRoute />}>
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/accessibility" element={<AccessibilitySettings />} />
                {/*관리자 라우트 추가*/}
                <Route element={<RoleRoute allowedRoles={['admin']} />}/>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  {/* 학생 라우트 */}
                  <Route element={<RoleRoute allowedRoles={['student']} />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/session/:sessionId" element={<StudentVideoChat />} />
                  </Route>
                  
                  {/* 선생님 라우트 */}
                  <Route element={<RoleRoute allowedRoles={['teacher']} />}>
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/create-session" element={<CreateSession />} />
                    <Route path="/teacher/session/:sessionId" element={<TeacherVideoChat />} />
                    <Route path="/teacher/edit-session/:sessionId" element={<EditSession />} />
                  </Route>
                  
                  {/* 공통 라우트 */}
                  <Route path="/settings/accessibility" element={<AccessibilitySettings />} />
                </Route>
                
                {/* 기본 리디렉션 */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </div>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
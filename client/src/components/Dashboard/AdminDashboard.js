import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  fetchAllTeachers, 
  fetchAllStudents, 
  fetchTeacherStudents,
  assignStudentsToTeacher
} from '../../services/api';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import '../../styles/Dashboard.css';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { authState } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 선생님 목록 로드
        const teacherList = await fetchAllTeachers();
        setTeachers(teacherList);
        
        // 학생 목록 로드
        const studentList = await fetchAllStudents();
        setStudents(studentList);
        
        setError(null);
      } catch (err) {
        console.error('데이터 로드 오류:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // 선생님 선택 시 해당 선생님에게 할당된 학생 목록 로드
  const handleTeacherSelect = async (teacherId) => {
    try {
      const selectedTeacher = teachers.find(t => t.id === parseInt(teacherId));
      setSelectedTeacher(selectedTeacher);
      
      if (selectedTeacher) {
        const assignedStudentList = await fetchTeacherStudents(selectedTeacher.id);
        setAssignedStudents(assignedStudentList);
        setSelectedStudents(assignedStudentList.map(s => s.id));
      } else {
        setAssignedStudents([]);
        setSelectedStudents([]);
      }
    } catch (err) {
      console.error('할당된 학생 목록 로드 오류:', err);
      setError('할당된 학생 목록을 불러오는데 실패했습니다.');
    }
  };
  
  // 선택된 학생 변경 처리
  const handleStudentSelect = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions, 
      option => parseInt(option.value)
    );
    setSelectedStudents(selectedOptions);
  };
  
  // 학생 할당 저장
  const handleSaveAssignment = async () => {
    if (!selectedTeacher) {
      setError('선생님을 먼저 선택해주세요.');
      return;
    }
    
    try {
      setSaving(true);
      await assignStudentsToTeacher(selectedTeacher.id, selectedStudents);
      
      // 할당 후 목록 다시 로드
      const updatedAssignedStudents = await fetchTeacherStudents(selectedTeacher.id);
      setAssignedStudents(updatedAssignedStudents);
      
      alert('학생 할당이 완료되었습니다.');
    } catch (err) {
      console.error('학생 할당 오류:', err);
      setError('학생 할당에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <Sidebar />
        
        <main className="main-content">
          <div className="welcome-section">
            <h1>관리자 대시보드</h1>
            <p>선생님과 학생을 관리하고 매칭할 수 있습니다.</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <section className="dashboard-section">
            <h2>학생-선생님 매칭</h2>
            
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <span>데이터를 불러오는 중...</span>
              </div>
            ) : (
              <div className="admin-grid">
                <div className="admin-panel teacher-select-panel">
                  <h3>선생님 선택</h3>
                  <select 
                    className="teacher-select" 
                    onChange={(e) => handleTeacherSelect(e.target.value)}
                    value={selectedTeacher ? selectedTeacher.id : ''}
                  >
                    <option value="">선생님을 선택하세요</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.username} ({teacher.email})
                      </option>
                    ))}
                  </select>
                  
                  {selectedTeacher && (
                    <div className="selected-teacher-info">
                      <h4>선택된 선생님</h4>
                      <p><strong>이름:</strong> {selectedTeacher.username}</p>
                      <p><strong>이메일:</strong> {selectedTeacher.email}</p>
                      <p><strong>할당된 학생:</strong> {assignedStudents.length}명</p>
                    </div>
                  )}
                </div>
                
                <div className="admin-panel student-assign-panel">
                  <h3>학생 할당</h3>
                  
                  {!selectedTeacher ? (
                    <div className="empty-selection-message">
                      먼저 선생님을 선택해주세요.
                    </div>
                  ) : (
                    <>
                      <div className="student-select-container">
                        <label htmlFor="students">할당할 학생 선택 (다중 선택 가능)</label>
                        <select
                          id="students"
                          multiple
                          size="10"
                          onChange={handleStudentSelect}
                          value={selectedStudents.map(id => id.toString())}
                          className="student-select"
                        >
                          {students.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.username} ({student.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="assigned-students-info">
                        <h4>현재 할당된 학생: {assignedStudents.length}명</h4>
                        {assignedStudents.length > 0 ? (
                          <ul className="assigned-student-list">
                            {assignedStudents.map(student => (
                              <li key={student.id}>
                                {student.username} ({student.email})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>아직 할당된 학생이 없습니다.</p>
                        )}
                      </div>
                      
                      <button 
                        className="save-assignment-btn"
                        onClick={handleSaveAssignment}
                        disabled={saving}
                      >
                        {saving ? '저장 중...' : '학생 할당 저장'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
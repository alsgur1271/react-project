import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8080/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// 요청 인터셉터 - 토큰 추가 및 로깅
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log(`API 요청: ${config.method.toUpperCase()} ${config.url}`);
    console.log('로컬 스토리지 토큰:', token ? '있음' : '없음');
    
    if (token) {
      console.log('토큰 첨부:', `Bearer ${token.substring(0, 10)}...`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('토큰이 없습니다. 인증 헤더가 추가되지 않습니다.');
    }
    
    return config;
  },
  (error) => {
    console.error('API 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);
/*
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

*/

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401 에러 (인증 실패)
      if (error.response.status === 401) {
        console.error('인증 오류:', error.response.data);
      }
      
      // CORS 에러 확인
      if (error.message.includes('Network Error') || 
          error.message.includes('CORS')) {
        console.error('CORS 또는 네트워크 오류:', error);
      }
    }
    return Promise.reject(error);
  }
);


// 인증 API
export const loginUser = async (credentials) => {
  console.log('로그인 요청 데이터:', credentials); // 디버깅용 로그
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('로그인 API 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify/${token}`);
  return response.data;
};

// 사용자 관련 API
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};


// 세션(수업) 관련 API
export const createSession = async (sessionData) => {
  const response = await api.post('/sessions', sessionData);
  return response.data;
};

export const fetchTeacherSessions = async () => {
  const response = await api.get('/sessions/teacher');
  return response.data;
};

export const fetchUpcomingSessions = async () => {
  const response = await api.get('/sessions/upcoming');
  return response.data;
};

export const fetchActiveSession = async () => {
  const response = await api.get('/sessions/active');
  return response.data;
};

export const getSessionDetails = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data;
};

export const startSession = async (sessionId) => {
  const response = await api.post(`/sessions/${sessionId}/start`);
  return response.data;
};

export const endSession = async (sessionId) => {
  const response = await api.post(`/sessions/${sessionId}/end`);
  return response.data;
};

// 접근성 설정 관련 API
export const getAccessibilitySettings = async () => {
  try {
    const response = await api.get('/users/accessibility');
    return response.data;
  } catch (error) {
    // 엔드포인트가 없을 경우 기본값 반환
    console.error('접근성 설정 가져오기 오류:', error);
    return {
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false
    };
  }
};

export const updateAccessibilitySettings = async (settings) => {
  try {
    const response = await api.put('/users/accessibility', settings);
    return response.data;
  } catch (error) {
    // 엔드포인트가 없을 경우 전달받은 설정 그대로 반환
    console.error('접근성 설정 업데이트 오류:', error);
    return settings;
  }
};

// 관리자 관련 API
export const fetchAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

// 모든 선생님 목록 가져오기
export const fetchAllTeachers = async () => {
  try {
    const response = await api.get('/admin/teachers');
    return response.data;
  } catch (error) {
    console.error('선생님 목록 가져오기 오류:', error);
    return []; // 에러 시 빈 배열 반환
  }
};

// 모든 학생 목록 가져오기
export const fetchAllStudents = async () => {
  try {
    const response = await api.get('/admin/students');
    return response.data;
  } catch (error) {
    console.error('학생 목록 가져오기 오류:', error);
    return []; // 에러 시 빈 배열 반환
  }
};

// 선생님에게 할당된 학생 목록 가져오기
export const fetchTeacherStudents = async (teacherId) => {
  try {
    const response = await api.get(`/admin/teachers/${teacherId}/students`);
    return response.data;
  } catch (error) {
    console.error('선생님-학생 매칭 가져오기 오류:', error);
    return []; // 에러 시 빈 배열 반환
  }
};

// 선생님에게 학생 할당하기 
export const assignStudentsToTeacher = async (teacherId, studentIds) => {
  try {
    console.log('학생 할당 요청:', { teacherId, studentIds });
    
    // 요청 형식 확인
    if (!Array.isArray(studentIds)) {
      console.error('studentIds는 배열이어야 합니다');
      throw new Error('Invalid studentIds format');
    }
    
    // 명시적으로 객체 형태로 데이터 전송
    const response = await api.post(`/admin/teachers/${teacherId}/students`, {
      studentIds: studentIds
    });
    
    console.log('학생 할당 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('학생 할당 오류:', error);
    throw error;
  }
};

/*
export const assignStudentsToTeacher = async (teacherId, studentIds) => {
  try {
    console.log('학생 할당 요청:', { teacherId, studentIds });
    
    const response = await api.post(`/admin/teachers/${teacherId}/students`, {
      studentIds: studentIds // 반드시 이 형식으로 보내야 함
    });
    
    return response.data;
  } catch (error) {
    console.error('학생 할당 오류:', error);
    throw error;
  }
};
*/

/*
export const assignStudentsToTeacher = async (teacherId, studentIds) => {
  const response = await api.post(`/admin/teachers/${teacherId}/students`, {
    studentIds
  });
  return response.data;
};
*/
 
// 선생님 API
// 선생님에게 할당된 학생 목록 가져오기 (내 학생 목록)
export const fetchMyStudents = async () => {
  try {
    const response = await api.get('/users/teacher/students');
    return response.data;
  } catch (error) {
    console.error('내 학생 목록 가져오기 오류:', error);
    throw error;
  }
};

// 일반 학생 목록 가져오기 (모든 학생)
export const fetchStudentList = async () => {
  try {
    const response = await api.get('/users/students');
    return response.data;
  } catch (error) {
    console.error('학생 목록 가져오기 오류:', error);
    throw error;
  }
};

// 수업 수정
export const updateSession = async (sessionId, sessionData) => {
  const response = await api.put(`/sessions/${sessionId}`, sessionData);
  return response.data;
};

// 수업 삭제
export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/sessions/${sessionId}`);
  return response.data;
};

// 수업 참가자 목록 가져오기
export const getSessionParticipants = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}/participants`);
  return response.data;
};

export default api;
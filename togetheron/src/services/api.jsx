import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// 요청 인터셉터 - 토큰 추가
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

// 응답 인터셉터 - 에러 처리 및 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 토큰이 만료된 경우 로그아웃 처리
      localStorage.removeItem('token');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
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

// 학생 리스트 가져오기
export const fetchStudentList = async () => {
  try {
    const response = await api.get('/users/students');
    return response.data;
  } catch (error) {
    console.error("학생 목록 가져오기 오류:", error);
    // 백엔드 연결 문제가 있을 경우 테스트용 더미 데이터 반환
    return [
      { id: 1, username: "학생1", /*email: "student1@example.com"*/ },
      { id: 2, username: "학생2", /*email: "student2@example.com"*/ },
      { id: 3, username: "학생3", /*email: "student3@example.com"*/ },
      { id: 4, username: "학생4", /*email: "student4@example.com"*/ },
      { id: 5, username: "학생5", /*email: "student5@example.com"*/ }
    ];
  }
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

export default api;
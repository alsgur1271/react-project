import api from './api';

// 회원가입
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// 이메일 인증
export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify/${token}`);
  return response.data;
};

// 로그인
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// 사용자 프로필 가져오기
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// 비밀번호 변경
export const changePassword = async (passwordData) => {
  const response = await api.put('/users/password', passwordData);
  return response.data;
};

// 비밀번호 재설정 요청
export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/password-reset-request', { email });
  return response.data;
};

// 비밀번호 재설정
export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/password-reset', { token, newPassword });
  return response.data;
};
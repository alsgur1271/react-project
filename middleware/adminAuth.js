// middleware/adminAuth.js
module.exports = (req, res, next) => {
  // preflight OPTIONS 요청은 무조건 통과
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  if (!req.user) {
    return res.status(401).json({ message: '인증되지 않은 요청입니다.' });
  }
  
  // 관리자 확인 (role = admin 인지 확인)
  if (req.user.role === "admin") {
    return next();
  }
  
  console.log('관리자 접근 거부:', req.user);
  return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
};
// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // preflight OPTIONS 요청은 무조건 통과
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // Authorization 헤더에서 토큰 확인
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('Authorization 헤더 없음');
    return res.status(401).json({ message: '인증 토큰이 없습니다.' });
  }
  
  // Bearer 접두사 확인 및 제거
  const tokenParts = authHeader.split(' ');
  const token = tokenParts.length === 2 && tokenParts[0] === 'Bearer' 
    ? tokenParts[1] 
    : authHeader;
  
  try {
    // 토큰 확인
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    const decoded = jwt.verify(token, secret);
    
    // 사용자 정보 저장
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      verified: parseInt(decoded.verified || 0) // 숫자로 변환
    };
    
    next();
  } catch (error) {
    console.error('JWT 검증 오류:', error.message);
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
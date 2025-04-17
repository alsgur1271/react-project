module.exports = (req, res, next) => {
    // email_verified가 2인 경우에만 관리자로 처리
    if (req.user && req.user.email_verified === 2) {
      next();
    } else {
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }
  };
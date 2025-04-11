const nodemailer = require('nodemailer');
require('dotenv').config();

// 메일 전송을 위한 트랜스포터 생성
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 인증 이메일 전송
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
  
  const mailOptions = {
    from: `"TogetherOn" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'TogetherOn 계정 인증',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4CAF50;">TogetherOn 계정 인증</h2>
        <p>TogetherOn에 가입해주셔서 감사합니다!</p>
        <p>아래 버튼을 클릭하여 이메일 주소를 인증해주세요:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">계정 인증하기</a>
        <p>또는 다음 링크를 브라우저에 복사하여 붙여넣으세요:</p>
        <p>${verificationUrl}</p>
        <p>이 링크는 24시간 동안 유효합니다.</p>
        <p>감사합니다.<br>TogetherOn 팀</p>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail
};
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // 새 CSS 파일 생성

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>TogetherOn</h3>
            <p>함께하는 온라인 교육 플랫폼</p>
            <p className="copyright">&copy; {new Date().getFullYear()} TogetherOn. All rights reserved.</p>
          </div>
          
          <div className="footer-section">
            <h3>바로가기</h3>
            <ul className="footer-links">
              <li><Link to="/">홈</Link></li>
              <li><Link to="/about">소개</Link></li>
              <li><Link to="/contact">문의하기</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>정책</h3>
            <ul className="footer-links">
              <li><Link to="/privacy">개인정보처리방침</Link></li>
              <li><Link to="/terms">이용약관</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>문의</h3>
            <p>이메일: support@togetheron.com</p>
            <p>전화: 02-123-4567</p>
            <div className="social-links">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css";



const Home = () => {
  return (
    <div className="accessibility-page">
      <div className="home-content-grid">
        {/* 시각장애 콘텐츠 */}
        <div className="home-section home-visual">
          <h2>시각장애 콘텐츠</h2>
          <div className="home-section-inner">
            <div>
              <h3>화면해설</h3>
              <ul>
                <li>초등 강좌</li>
                <li>중학 강좌</li>
                <li>고교 강좌</li>
                <li>평생교육</li>
                <li>영어교육</li>
              </ul>
            </div>
            <div>
              <h3>다시듣기</h3>
              <ul>
                <li>교과서</li>
                <li>평생교육</li>
                <li>어학</li>
                <li>어학강좌</li>
              </ul>
            </div>
          </div>
          <button className="home-menu-button">시각장애 콘텐츠 전용 메뉴 바로가기</button>
        </div>

        {/* 청각장애 콘텐츠 */}
        <div className="home-section home-hearing">
          <h2>청각장애 콘텐츠</h2>
          <div className="home-section-inner">
            <div>
              <h3>자막</h3>
              <ul>
                <li><a href="#">초등 강좌</a></li>
                <li><a href="#">중학 강좌</a></li>
                <li><a href="#">고교 강좌</a></li>
                <li><a href="#">평생교육</a></li>
                <li><a href="#">영어교육</a></li>
                <li><a href="#">수학교육</a></li>
              </ul>
            </div>
            <div>
              <h3>수어</h3>
              <ul>
                <li>평생교육</li>
              </ul>
            </div>
          </div>
          <button className="home-menu-button">청각장애 콘텐츠 전용 메뉴 바로가기</button>
        </div>

        {/* 발달장애 콘텐츠 */}
        <div className="home-section home-developmental">
          <h2>발달장애 콘텐츠</h2>
          <div className="home-section-inner">
            <div>
              <h3>발달장애</h3>
              <ul>
                <li>평생교육</li>
              </ul>
            </div>
          </div>
          <div className="home-faq-box">궁금해요?</div>
          <div className="home-info-links">
            <div>📥 콘텐츠 업데이트</div>
            <div>📚 방송 콘텐츠 무료이용안내</div>
            <div>💬 이용문의</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
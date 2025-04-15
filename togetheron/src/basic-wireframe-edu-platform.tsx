import React, { useState } from 'react';

const VisuallyImpairedEducationPlatform = () => {
  const [currentPage, setCurrentPage] = useState('login');
  
  const renderPage = () => {
    switch(currentPage) {
      case 'login':
        return <LoginPage navigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage navigate={setCurrentPage} />;
      case 'main':
        return <MainPage navigate={setCurrentPage} />;
      case 'videoChat':
        return <VideoChatPage navigate={setCurrentPage} />;
      case 'recordings':
        return <RecordingsPage navigate={setCurrentPage} />;
      case 'schedule':
        return <SchedulePage navigate={setCurrentPage} />;
      case 'achievements':
        return <AchievementsPage navigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPage navigate={setCurrentPage} />;
      default:
        return <LoginPage navigate={setCurrentPage} />;
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      {renderPage()}
    </div>
  );
};

// 로그인 페이지
const LoginPage = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', border: '1px solid #ccc', padding: '20px' }}>
      <h1>시각장애인 아동 화상교육 플랫폼</h1>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="username">아이디:</label>
        <input id="username" type="text" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="password">비밀번호:</label>
        <input id="password" type="password" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
      </div>
      
      <button 
        onClick={() => navigate('main')}
        style={{ width: '100%', padding: '15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        로그인
      </button>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => navigate('register')}
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

// 회원가입 페이지
const RegisterPage = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', border: '1px solid #ccc', padding: '20px' }}>
      <h1>회원가입</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="username">아이디:</label>
        <input id="username" type="text" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="password">비밀번호:</label>
        <input id="password" type="password" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="name">이름:</label>
        <input id="name" type="text" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="age">나이:</label>
        <input id="age" type="number" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
      </div>
      
      <button 
        onClick={() => navigate('login')}
        style={{ width: '100%', padding: '15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '10px' }}
      >
        회원가입
      </button>
      
      <button 
        onClick={() => navigate('login')}
        style={{ width: '100%', padding: '15px', backgroundColor: '#ccc', color: 'black', border: 'none', cursor: 'pointer' }}
      >
        취소
      </button>
    </div>
  );
};

// 메인 페이지
const MainPage = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>메인 페이지</h1>
        <button onClick={() => navigate('login')}>로그아웃</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('videoChat')}
          style={{ padding: '30px', border: '1px solid #ccc', textAlign: 'center' }}
        >
          화상수업 시작하기
        </button>
        
        <button 
          onClick={() => navigate('recordings')}
          style={{ padding: '30px', border: '1px solid #ccc', textAlign: 'center' }}
        >
          저장된 수업
        </button>
        
        <button 
          onClick={() => navigate('schedule')}
          style={{ padding: '30px', border: '1px solid #ccc', textAlign: 'center' }}
        >
          수업 일정
        </button>
        
        <button 
          onClick={() => navigate('achievements')}
          style={{ padding: '30px', border: '1px solid #ccc', textAlign: 'center' }}
        >
          나의 성취
        </button>
        
        <button 
          onClick={() => navigate('settings')}
          style={{ padding: '30px', border: '1px solid #ccc', textAlign: 'center' }}
        >
          설정
        </button>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h2>다음 수업</h2>
        <p>오늘 오후 2시 - 음악 수업</p>
        <button onClick={() => navigate('videoChat')}>
          수업 입장하기
        </button>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h2>공지사항</h2>
        <p>내일 수학 수업은 30분 일찍 시작합니다.</p>
      </div>
    </div>
  );
};

// 화상채팅 페이지
const VideoChatPage = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', border: '1px solid #ccc', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>화상 수업</h1>
        <button onClick={() => navigate('main')}>
          나가기
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, border: '1px solid #ccc', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>선생님 화면</p>
        </div>
        
        <div style={{ flex: 1, border: '1px solid #ccc', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>내 화면</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        <button style={{ padding: '10px 20px' }}>마이크 켜기/끄기</button>
        <button style={{ padding: '10px 20px' }}>카메라 켜기/끄기</button>
        <button style={{ padding: '10px 20px' }}>수업 녹화하기</button>
        <button style={{ padding: '10px 20px' }}>손들기</button>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h2>오늘의 학습 내용</h2>
        <ul>
          <li>악기 소리 듣고 맞추기</li>
          <li>간단한 리듬 따라 하기</li>
        </ul>
      </div>
    </div>
  );
};

// 녹화된 수업 페이지
const RecordingsPage = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>저장된 수업</h1>
        <button onClick={() => navigate('main')}>
          메인으로
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>최근 녹화</h2>
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
          <h3>음악 수업 - 2025년 3월 15일</h3>
          <p>녹화 길이: 45분</p>
          <button>재생하기</button>
          <button>다운로드</button>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
          <h3>국어 수업 - 2025년 3월 12일</h3>
          <p>녹화 길이: 50분</p>
          <button>재생하기</button>
          <button>다운로드</button>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
          <h3>수학 수업 - 2025년 3월 10일</h3>
          <p>녹화 길이: 40분</p>
          <button>재생하기</button>
          <button>다운로드</button>
        </div>
      </div>
    </div>
  );
};

// 수업 일정 페이지
const SchedulePage = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>수업 일정</h1>
        <button onClick={() => navigate('main')}>
          메인으로
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>이번 주 일정</h2>
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
          <h3>오늘</h3>
          <p>오후 2시 - 음악 수업</p>
          <p>선생님: 김선생님</p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
          <h3>내일</h3>
          <p>오전 10시 - 국어 수업</p>
          <p>선생님: 이선생님</p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
          <h3>3월 21일 목요일</h3>
          <p>오후 1시 - 수학 수업</p>
          <p>선생님: 박선생님</p>
        </div>
      </div>
      
      <button style={{ padding: '10px 20px', width: '100%' }}>
        전체 일정 보기
      </button>
    </div>
  );
};

// 성취 페이지
const AchievementsPage = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>나의 성취</h1>
        <button onClick={() => navigate('main')}>
          메인으로
        </button>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h2>배움 레벨</h2>
        <p>현재 레벨: 3</p>
        <div style={{ border: '1px solid #ccc', height: '20px', marginTop: '10px' }}>
          <div style={{ width: '60%', height: '100%', backgroundColor: '#4CAF50' }}></div>
        </div>
        <p>다음 레벨까지: 3개 수업 더 듣기</p>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h2>획득한 뱃지</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
            <p>첫 수업 완료</p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
            <p>음악 천재</p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
            <p>5개 수업 완료</p>
          </div>
        </div>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h2>최근 성취</h2>
        <ul>
          <li>음악 수업 5회 완료!</li>
          <li>국어 퀴즈 만점!</li>
        </ul>
      </div>
    </div>
  );
};

// 설정 페이지
const SettingsPage = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>설정</h1>
        <button onClick={() => navigate('main')}>
          메인으로
        </button>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h2>화면 설정</h2>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="fontSize">글자 크기:</label>
          <select id="fontSize" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }}>
            <option>기본</option>
            <option>크게</option>
            <option>아주 크게</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="contrast">대비:</label>
          <select id="contrast" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }}>
            <option>기본</option>
            <option>높음</option>
            <option>매우 높음</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input type="checkbox" id="highContrast" />
          <label htmlFor="highContrast">고대비 모드 사용</label>
        </div>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h2>화상 수업 설정</h2>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="micDevice">마이크:</label>
          <select id="micDevice" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }}>
            <option>기본 마이크</option>
            <option>헤드셋 마이크</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="speakerDevice">스피커:</label>
          <select id="speakerDevice" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }}>
            <option>기본 스피커</option>
            <option>헤드셋</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input type="checkbox" id="autoCaptions" />
          <label htmlFor="autoCaptions">자동 자막 생성</label>
        </div>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h2>접근성 설정</h2>
        <div style={{ marginBottom: '15px' }}>
          <input type="checkbox" id="screenReader" />
          <label htmlFor="screenReader">화면 읽기 최적화</label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input type="checkbox" id="soundFeedback" />
          <label htmlFor="soundFeedback">소리 피드백 사용</label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="readingSpeed">읽기 속도:</label>
          <select id="readingSpeed" style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }}>
            <option>느리게</option>
            <option>보통</option>
            <option>빠르게</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default VisuallyImpairedEducationPlatform;

// src/contexts/AccessibilityContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    fontSize: 'medium', // small, medium, large
    highContrast: false,
    screenReader: false // 스크린 리더 지원 추가
  });
  
  useEffect(() => {
    // 로컬 스토리지에서 설정 불러오기
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        setAccessibilitySettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('설정 파싱 오류:', e);
      }
    }
  }, []);
  
  // 문서 루트에 클래스 적용
  useEffect(() => {
    const root = document.documentElement;
    
    // 글꼴 크기 클래스
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    root.classList.add(`font-size-${accessibilitySettings.fontSize}`);
    
    // 고대비 모드 클래스
    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // 스크린 리더 지원 클래스
    if (accessibilitySettings.screenReader) {
      root.classList.add('screen-reader-support');
    } else {
      root.classList.remove('screen-reader-support');
    }
    
    // 글꼴 크기 CSS 변수 설정 (직접 크기 지정)
    if (accessibilitySettings.fontSize === 'small') {
      document.body.style.setProperty('--font-size-base', '14px');
      document.body.style.setProperty('--font-size-h1', '24px');
      document.body.style.setProperty('--font-size-h2', '20px');
      document.body.style.setProperty('--font-size-h3', '18px');
      document.body.style.setProperty('--font-size-h4', '16px');
    } else if (accessibilitySettings.fontSize === 'medium') {
      document.body.style.setProperty('--font-size-base', '16px');
      document.body.style.setProperty('--font-size-h1', '28px');
      document.body.style.setProperty('--font-size-h2', '24px');
      document.body.style.setProperty('--font-size-h3', '20px');
      document.body.style.setProperty('--font-size-h4', '18px');
    } else if (accessibilitySettings.fontSize === 'large') {
      document.body.style.setProperty('--font-size-base', '18px');
      document.body.style.setProperty('--font-size-h1', '32px');
      document.body.style.setProperty('--font-size-h2', '28px');
      document.body.style.setProperty('--font-size-h3', '24px');
      document.body.style.setProperty('--font-size-h4', '20px');
    }
    
    // ARIA 관련 속성 추가 (스크린 리더 모드 활성화시)
    if (accessibilitySettings.screenReader) {
      // 중요 버튼에 ARIA 레이블 추가
      document.querySelectorAll('button:not([aria-label])').forEach(btn => {
        if (btn.textContent) {
          btn.setAttribute('aria-label', btn.textContent.trim());
        }
      });
      
      // 폼 입력 필드에 ARIA 레이블 연결
      document.querySelectorAll('input:not([aria-labelledby])').forEach(input => {
        const id = input.id;
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
          if (!label.id) {
            label.id = `label-for-${id}`;
          }
          input.setAttribute('aria-labelledby', label.id);
        }
      });
    }
  }, [accessibilitySettings]);
  
  // 설정 업데이트
  const updateSettings = (newSettings) => {
    setAccessibilitySettings(newSettings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
  };
  
  return (
    <AccessibilityContext.Provider value={{ 
      accessibilitySettings, 
      updateSettings 
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
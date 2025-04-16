import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { updateAccessibilitySettings, getAccessibilitySettings } from '../services/api';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    fontSize: 'medium',
    enableScreenReader: false
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      if (authState.isAuthenticated && authState.user) {
        try {
          const settings = await getAccessibilitySettings();
          setAccessibilitySettings(settings);
        } catch (err) {
          console.error('접근성 설정 로드 오류:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    if (!authState.loading) {
      loadSettings();
    }
  }, [authState.isAuthenticated, authState.user, authState.loading]);
  
  const updateSettings = async (newSettings) => {
    try {
      setAccessibilitySettings(newSettings);
      if (authState.isAuthenticated) {
        await updateAccessibilitySettings(newSettings);
      }
    } catch (err) {
      console.error('접근성 설정 업데이트 오류:', err);
    }
  };
  
  return (
    <AccessibilityContext.Provider
      value={{
        accessibilitySettings,
        updateSettings,
        loading
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
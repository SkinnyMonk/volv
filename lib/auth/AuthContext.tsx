/* eslint-disable */
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useLayoutEffect } from 'react';
import type { LoginResponse, TwoFAResponse } from '@/lib/auth/authService';
import { setAuthToken as setAxiosToken } from '@/lib/axios';

export interface AuthContextType {
  // Auth state
  isAuthenticated: boolean;
  authToken: string | null;
  user: {
    name: string;
    loginId: string;
  } | null;

  // Login flow
  currentStep: 'idle' | 'clientId' | 'otp' | 'twofa' | 'success' | 'error';
  clientId: string;
  loginId: string;
  referenceToken: string | null;
  twoFAToken: string | null;
  twoFAType: string | null;
  twoFAQuestions: Array<{ question: string; question_id: number }>;
  otpTimer: { second: number; minute: number } | null;
  errorMessage: string;

  // Actions
  setClientId: (id: string) => void;
  setCurrentStep: (step: AuthContextType['currentStep']) => void;
  setErrorMessage: (message: string) => void;
  setLoginResponse: (response: LoginResponse) => void;
  setTwoFAResponse: (response: TwoFAResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; loginId: string } | null>(null);

  const [currentStep, setCurrentStep] = useState<AuthContextType['currentStep']>('idle');
  const [clientId, setClientId] = useState('');
  const [loginId, setLoginId] = useState('');
  const [referenceToken, setReferenceToken] = useState<string | null>(null);
  const [twoFAToken, setTwoFAToken] = useState<string | null>(null);
  const [twoFAType, setTwoFAType] = useState<string | null>(null);
  const [twoFAQuestions, setTwoFAQuestions] = useState<Array<{ question: string; question_id: number }>>([]);
  const [otpTimer, setOtpTimer] = useState<{ second: number; minute: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Use layoutEffect to hydrate from localStorage before paint
  // This prevents hydration mismatch by ensuring state is synchronized early
  useLayoutEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      // This setState pattern is necessary for hydration-safe initialization
      setAuthToken(storedToken);
      setIsAuthenticated(true);
      setAxiosToken(storedToken);
    }
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }, []);

  // Sync auth token with axios instance
  useEffect(() => {
    setAxiosToken(authToken);
  }, [authToken]);

  // Save auth state to localStorage when it changes
  useEffect(() => {
    if (authToken && user) {
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [authToken, user]);

  const handleSetLoginResponse = (response: LoginResponse) => {
    setLoginId(response.data.login_id);
    setUser({
      name: response.data.name,
      loginId: response.data.login_id,
    });

    if (response.data.reference_token) {
      setReferenceToken(response.data.reference_token);
    }

    if (response.data.twofa_enabled) {
      if (response.data.twofa.twofa_token) {
        setTwoFAToken(response.data.twofa.twofa_token);
        setTwoFAType(response.data.twofa.type || null);
        setTwoFAQuestions(response.data.twofa.questions || []);
        setCurrentStep('twofa');
      } else if (response.data.alert === 'Login OTP') {
        setOtpTimer(response.data.timer || null);
        setCurrentStep('otp');
      }
    }

    if (response.status !== 'success') {
      setErrorMessage(response.message || 'Authentication failed');
      setCurrentStep('error');
    }
  };

  const handleSetTwoFAResponse = (response: TwoFAResponse) => {
    if (response.status === 'success') {
      // Preserve user data that was set during login
      const newUser = {
        name: response.data.name || user?.name || 'User',
        loginId: response.data.login_id || user?.loginId || '',
      };
      
      setAuthToken(response.data.auth_token);
      setUser(newUser);
      setIsAuthenticated(true);
      setCurrentStep('success');
      
      // Also save to localStorage immediately to ensure persistence
      localStorage.setItem('authToken', response.data.auth_token);
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      setErrorMessage(response.message || '2FA verification failed');
      setCurrentStep('error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setUser(null);
    setCurrentStep('idle');
    setClientId('');
    setLoginId('');
    setReferenceToken(null);
    setTwoFAToken(null);
    setTwoFAType(null);
    setTwoFAQuestions([]);
    setOtpTimer(null);
    setErrorMessage('');
    setAxiosToken(null);

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    isAuthenticated,
    authToken,
    user,
    currentStep,
    clientId,
    loginId,
    referenceToken,
    twoFAToken,
    twoFAType,
    twoFAQuestions,
    otpTimer,
    errorMessage,
    setClientId,
    setCurrentStep,
    setErrorMessage,
    setLoginResponse: handleSetLoginResponse,
    setTwoFAResponse: handleSetTwoFAResponse,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { ClientIdForm } from '@/components/auth/ClientIdForm';
import { OTPForm } from '@/components/auth/OTPForm';
import { TwoFAForm } from '@/components/auth/TwoFAForm';
import { useEffect, useState, useRef } from 'react';

export default function LoginPage() {
  const { currentStep, user, errorMessage, isAuthenticated, logout } = useAuth();
  const [showFallback, setShowFallback] = useState(false);
  const redirectAttemptRef = useRef(0);

  // Redirect to dashboard on successful login
  useEffect(() => {
    if (isAuthenticated && currentStep === 'success') {
      redirectAttemptRef.current = 0;
      
      // Direct redirect - use native JavaScript for guaranteed execution
      const redirect = () => {
        const authToken = localStorage.getItem('authToken');
        
        if (authToken) {
          // Use window.location for hard redirect - this ALWAYS works
          window.location.href = '/dashboard';
        } else {
          setShowFallback(true);
        }
      };

      // Immediate redirect
      redirect();

      // Safety backup: redirect again after 500ms if still needed
      const backupTimer = setTimeout(() => {
        const authToken = localStorage.getItem('authToken');
        if (authToken && typeof window !== 'undefined' && window.location.pathname === '/auth/login') {
          window.location.href = '/dashboard';
        }
      }, 500);

      return () => {
        clearTimeout(backupTimer);
      };
    }
  }, [isAuthenticated, currentStep]);

  // Additional safety check - continuously redirect if auth token exists and we're on login page
  useEffect(() => {
    if (isAuthenticated || currentStep === 'success') {
      const checkAndRedirect = () => {
        const authToken = localStorage.getItem('authToken');
        if (authToken && typeof window !== 'undefined' && window.location.pathname === '/auth/login') {
          window.location.href = '/dashboard';
        }
      };

      // Check immediately
      checkAndRedirect();

      // Also check every 300ms
      const interval = setInterval(checkAndRedirect, 300);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentStep]);

  // Handle fallback - clear auth and prompt to login again
  const handleFallback = () => {
    
    // Clear everything
    logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Reset state
    setShowFallback(false);
    
    // Force a hard page reload to reset all state
    window.location.href = '/auth/login';
  };

  if (showFallback) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Redirect Issue</h2>
          <p className="text-gray-400 mb-6">
            We encountered an issue redirecting you to the dashboard. Your login has been cleared. Please try logging in again.
          </p>
          <button
            onClick={handleFallback}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  if (isAuthenticated || currentStep === 'success') {
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Login Successful!</h2>
          {user && (
            <p className="text-gray-400 mb-6">
              Welcome, <span className="font-semibold text-white">{user.name}</span>
            </p>
          )}
          <p className="text-gray-500 text-sm mb-4">Redirecting to dashboard...</p>
          
          
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">volv</h1>
          <p className="text-gray-400 text-sm">Trading Platform</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded-lg">
            <p className="text-sm text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Form Content */}
        <div className="space-y-6">
          {(currentStep === 'idle' || currentStep === 'clientId') && (
            <ClientIdForm />
          )}

          {currentStep === 'otp' && (
            <OTPForm />
          )}

          {currentStep === 'twofa' && (
            <TwoFAForm />
          )}
        </div>
      </div>
    </div>
  );
}

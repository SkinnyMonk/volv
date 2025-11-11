'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { ClientIdForm } from '@/components/auth/ClientIdForm';
import { OTPForm } from '@/components/auth/OTPForm';
import { TwoFAForm } from '@/components/auth/TwoFAForm';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { currentStep, user, errorMessage, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to dashboard on successful login
  useEffect(() => {
    if (isAuthenticated && currentStep === 'success') {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000); // Wait 2 seconds to show success message
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentStep, router]);

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
          <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <h1 className="text-2xl font-bold text-white">volv</h1>
          </div>
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

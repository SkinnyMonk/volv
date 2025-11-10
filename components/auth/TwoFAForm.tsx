'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

export function TwoFAForm() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginId, twoFAToken, twoFAQuestions, setTwoFAResponse, setErrorMessage } = useAuth();

  if (!twoFAQuestions || twoFAQuestions.length === 0) {
    return (
      <div className="p-4 bg-red-950 border border-red-800 rounded-lg text-red-300">
        No 2FA questions available. Please try again.
      </div>
    );
  }

  const question = twoFAQuestions[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginId || !twoFAToken) {
      setErrorMessage('Session expired. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/verify-twofa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId,
          pin,
          twoFAToken,
          questionId: question.question_id,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || '2FA verification failed');
      }

      setTwoFAResponse(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {question.question}
        </label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 tracking-widest text-center text-lg"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Verifying...' : 'Verify PIN'}
      </button>
    </form>
  );
}

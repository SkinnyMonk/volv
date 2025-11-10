'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthContext';

export function useAuthPersistence() {
  const { authToken, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_data', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }, [authToken, isAuthenticated, user]);
}

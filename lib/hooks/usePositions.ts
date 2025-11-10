'use client';

import { useState, useEffect } from 'react';
import { fetchPositions, Position } from '@/lib/api/positions';
import { useAuth } from '@/lib/auth/AuthContext';

export function usePositions() {
  const { user, isAuthenticated } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPositions([]);
      return;
    }

    async function loadPositions() {
      setLoading(true);
      setError(null);

      try {
        if (user === null) throw new Error('User not authenticated');
        const loginId = user.loginId;
        console.log(`[usePositions] Fetching historical positions for client: ${loginId}`);
        const response = await fetchPositions(loginId);
        
        console.log(`[usePositions] Response received:`, response);
        
        if (response.status === 'success' && Array.isArray(response.data)) {
          console.log(`[usePositions] Got ${response.data.length} positions`);
          setPositions(response.data);
        } else {
          const errorMsg = response.message || 'Failed to fetch positions';
          console.error(`[usePositions] Error: ${errorMsg}`);
          setError(errorMsg);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        console.error(`[usePositions] Exception: ${errorMessage}`, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadPositions();
  }, [isAuthenticated, user]);

  return {
    positions,
    loading,
    error,
    refetch: async () => {
      if (user && isAuthenticated) {
        try {
          const response = await fetchPositions(user.loginId);
          if (response.status === 'success' && Array.isArray(response.data)) {
            setPositions(response.data);
          }
        } catch (err) {
          console.error('Error refetching positions:', err);
        }
      }
    },
  };
}

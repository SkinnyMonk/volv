'use client';

import { useState, useEffect } from 'react';
import { fetchMarketWatches, MarketWatch } from '@/lib/api/marketwatch';
import { useAuth } from '@/lib/auth/AuthContext';

export function useMarketWatches() {
  const { user, isAuthenticated } = useAuth();
  const [marketWatches, setMarketWatches] = useState<MarketWatch[]>([]);
  const [selectedWatchId, setSelectedWatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setMarketWatches([]);
      setSelectedWatchId(null);
      return;
    }

    async function loadMarketWatches() {
      setLoading(true);
      setError(null);

      try {
        if (user === null) throw new Error('User not authenticated');
        const clientId = user.loginId;
        const response = await fetchMarketWatches(clientId);

        if (response.status === 'success' && Array.isArray(response.data)) {
          setMarketWatches(response.data);
          
          // Auto-select first watch with instruments, or first watch overall
          const watchWithInstruments = response.data.find((watch) => watch.instruments.length > 0);
          const defaultWatch = watchWithInstruments || response.data[0];
          
          if (defaultWatch) {
            setSelectedWatchId(defaultWatch.id);
          }
        } else {
          const errorMsg = response.message || 'Failed to fetch market watches';
          setError(errorMsg);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadMarketWatches();
  }, [isAuthenticated, user]);

  const selectedWatch = marketWatches.find((w) => w.id === selectedWatchId);

  return {
    marketWatches,
    selectedWatch,
    selectedWatchId,
    setSelectedWatchId,
    loading,
    error,
    refetch: async () => {
      if (user && isAuthenticated) {
        try {
          const response = await fetchMarketWatches(user.loginId);
          if (response.status === 'success' && Array.isArray(response.data)) {
            setMarketWatches(response.data);
            const watchWithInstruments = response.data.find((watch) => watch.instruments.length > 0);
            const defaultWatch = watchWithInstruments || response.data[0];
            if (defaultWatch) {
              setSelectedWatchId(defaultWatch.id);
            }
          }
        } catch (err) {
          console.error('Error refetching market watches:', err);
        }
      }
    },
  };
}

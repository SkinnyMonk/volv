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
        console.log(`[useMarketWatches] Fetching market watches for client: ${clientId}`);
        const response = await fetchMarketWatches(clientId);

        console.log(`[useMarketWatches] Response received:`, response);

        if (response.status === 'success' && Array.isArray(response.data)) {
          console.log(`[useMarketWatches] Got ${response.data.length} market watches`);
          setMarketWatches(response.data);
          
          // Auto-select first watch with instruments, or first watch overall
          const watchWithInstruments = response.data.find((watch) => watch.instruments.length > 0);
          const defaultWatch = watchWithInstruments || response.data[0];
          
          if (defaultWatch) {
            console.log(`[useMarketWatches] Auto-selected: ${defaultWatch.name} (${defaultWatch.instruments.length} instruments)`);
            setSelectedWatchId(defaultWatch.id);
          } else {
            console.warn('[useMarketWatches] No market watch found');
          }
        } else {
          const errorMsg = response.message || 'Failed to fetch market watches';
          console.error(`[useMarketWatches] Error: ${errorMsg}`);
          setError(errorMsg);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        console.error(`[useMarketWatches] Exception: ${errorMessage}`, err);
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

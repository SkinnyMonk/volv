'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchTrades, transformTradeForDisplay } from '@/lib/api/trades';

export interface DisplayTrade {
  id: string;
  symbol: string;
  tradingSymbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  orderPrice: number;
  time: string;
  timestamp: number;
  exchange: string;
  product: string;
  orderType: string;
  omsOrderId: string;
  exchangeOrderId: string;
  pan: string;
}

interface UseTradesOptions {
  clientId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Hook to fetch and manage trades
 */
export function useTrades(options: UseTradesOptions) {
  const {
    clientId,
    autoRefresh = true,
    refreshInterval = 5000, // 5 seconds
  } = options;

  const [trades, setTrades] = useState<DisplayTrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch trades
  const loadTrades = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rawTrades = await fetchTrades(clientId);
      const displayTrades = rawTrades.map(transformTradeForDisplay);

      // Sort by timestamp (newest first)
      displayTrades.sort((a, b) => b.timestamp - a.timestamp);

      setTrades(displayTrades);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('[useTrades] Error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch trades'
      );
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  // Auto-refresh effect
  useEffect(() => {
    // Initial load
    loadTrades();

    if (!autoRefresh) return;

    // Set up interval for auto-refresh
    const interval = setInterval(loadTrades, refreshInterval);
    return () => clearInterval(interval);
  }, [loadTrades, autoRefresh, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    loadTrades();
  }, [loadTrades]);

  return {
    trades,
    isLoading,
    error,
    lastUpdate,
    refresh,
  };
}

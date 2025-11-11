'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchOrders,
  OrderStatus,
  transformOrderForDisplay,
  filterOrdersByStatus,
} from '@/lib/api/orders';

export interface DisplayOrder {
  id: string;
  nnfId: number;
  symbol: string;
  tradingSymbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  price: number;
  averagePrice: number;
  orderType: string;
  status: string;
  exchange: string;
  product: string;
  time: string;
  timestamp: number;
  rejectionReason: string;
  triggerPrice: number;
  validity: string;
  executionType: string;
  device: string;
}

interface UseOrdersOptions {
  clientId: string;
  orderType?: OrderStatus;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Hook to fetch and manage orders
 */
export function useOrders(options: UseOrdersOptions) {
  const {
    clientId,
    orderType = 'completed',
    autoRefresh = true,
    refreshInterval = 5000, // 5 seconds
  } = options;

  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch orders
  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rawOrders = await fetchOrders(orderType, clientId);
      const filteredOrders = filterOrdersByStatus(rawOrders, orderType);
      const displayOrders = filteredOrders.map(transformOrderForDisplay);

      // Sort by timestamp (newest first)
      displayOrders.sort((a, b) => b.timestamp - a.timestamp);

      setOrders(displayOrders);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('[useOrders] Error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch orders'
      );
    } finally {
      setIsLoading(false);
    }
  }, [clientId, orderType]);

  // Auto-refresh effect
  useEffect(() => {
    // Initial load
    loadOrders();

    if (!autoRefresh) return;

    // Set up interval for auto-refresh
    const interval = setInterval(loadOrders, refreshInterval);
    return () => clearInterval(interval);
  }, [loadOrders, autoRefresh, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    isLoading,
    error,
    lastUpdate,
    refresh,
  };
}

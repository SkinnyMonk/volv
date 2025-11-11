'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import octopusInstance from '@/lib/octopus/octopusInstance';
import { getExchangeCode } from '@/lib/exchanges';

export interface TokenWithExchange {
  token: string | number;
  exchange: string;
}

export interface PriceData {
  token: string | number;
  exchange?: string;
  ltp?: number;
  change?: number;
  changePercent?: number;
  bid?: number;
  ask?: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface MarketDataMessage {
  topic: string;
  msg?: {
    instrumentToken?: string | number;
    token?: string | number;
    exchange?: string;
    lastTradedPrice?: number;
    ltp?: number;
    bestBidPrice?: number;
    bestAskPrice?: number;
    averageTradePrice?: number;
    openPrice?: number;
    highPrice?: number;
    lowPrice?: number;
    closePrice?: number;
    volume?: number;
    absoluteChange?: number;
    percentChange?: number;
    change?: number;
    changePercent?: number;
    [key: string]: string | number | undefined;
  };
}

export function useMarketWatchWebSocket(tokensWithExchange: TokenWithExchange[] = []) {
  const [priceData, setPriceData] = useState<Map<string | number, PriceData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef<Map<string | number, () => void>>(new Map());

  // Handle incoming market data updates
  const handleMarketDataUpdate = useCallback((message: MarketDataMessage) => {
    try {
      const msg = message.msg;
      if (!msg) {
        return;
      }

      // Extract token from message
      const token = msg.instrumentToken || msg.token;
      if (!token) {
        return;
      }

      // Map the formatted fields from the decoder to PriceData
      const updatedData: PriceData = {
        token,
        exchange: msg.exchange,
        ltp: (msg.lastTradedPrice || msg.ltp) as number | undefined,
        change: (msg.absoluteChange || msg.change) as number | undefined,
        changePercent: (msg.percentChange || msg.changePercent) as number | undefined,
        bid: (msg.bestBidPrice || msg.bidPrice) as number | undefined,
        ask: (msg.bestAskPrice || msg.askPrice) as number | undefined,
        volume: msg.volume as number | undefined,
        open: (msg.openPrice || msg.open) as number | undefined,
        high: (msg.highPrice || msg.high) as number | undefined,
        low: (msg.lowPrice || msg.low) as number | undefined,
        close: (msg.closePrice || msg.close) as number | undefined,
      };

      setPriceData((prev) => {
        const newMap = new Map(prev);
        newMap.set(token, updatedData);
        return newMap;
      });
    } catch {
      // Error handling market data
    }
  }, []);

  // Helper function to normalize exchange code using comprehensive exchange config
  const normalizeExchangeCode = (exchange: string | number): number => {
    return getExchangeCode(exchange);
  };

  // Subscribe to tokens
  const subscribeToTokens = useCallback(async (tokensToSub: TokenWithExchange[]) => {
    if (!tokensToSub.length || !octopusInstance.isConnected()) {
      return;
    }

    // Unsubscribe from tokens no longer needed
    const existingTokens = Array.from(subscriptionsRef.current.keys());
    const tokensToSubIds = tokensToSub.map(t => t.token);
    
    for (const token of existingTokens) {
      if (!tokensToSubIds.includes(token)) {
        const unsubscribeFn = subscriptionsRef.current.get(token);
        if (unsubscribeFn) {
          try {
            await unsubscribeFn();
            subscriptionsRef.current.delete(token);
          } catch {
            // Error unsubscribing
          }
        }
      }
    }

    // Subscribe to new tokens with their own exchange codes
    for (const { token, exchange } of tokensToSub) {
      if (!subscriptionsRef.current.has(token)) {
        try {
          const numericExchangeCode = normalizeExchangeCode(exchange);
          
          const handler = octopusInstance.wsHandler({
            messageType: 'DetailMarketDataMessage',
            subscriptionLocation: '',
            payload: {
              exchangeCode: numericExchangeCode,
              instrumentToken: token,
            },
          });

          if (handler) {
            await handler.subscribe((msg: unknown) => handleMarketDataUpdate(msg as MarketDataMessage));
            subscriptionsRef.current.set(token, () => {
              void handler.unsubscribe();
            });
          }
        } catch {
          // Error subscribing
        }
      }
    }
  }, [handleMarketDataUpdate]);

  // Connect WebSocket and subscribe to tokens
  useEffect(() => {
    const subscriptions = subscriptionsRef.current;
    let isMounted = true;
    
    const initializeWebSocket = async () => {
      try {
        const connected = await octopusInstance.connect();
        
        if (!isMounted) return;
        
        setIsConnected(connected);

        if (connected && tokensWithExchange.length > 0) {
          await subscribeToTokens(tokensWithExchange);
          
          if (isMounted) {
            // Subscriptions complete
          }
        }
      } catch {
        if (isMounted) {
          setIsConnected(false);
        }
      }
    };

    initializeWebSocket();

    // Cleanup function
    return () => {
      isMounted = false;
      // Cleanup subscriptions on unmount
      subscriptions.forEach((unsubscribeFn) => {
        unsubscribeFn();
      });
      subscriptions.clear();
    };
  }, [tokensWithExchange, subscribeToTokens]);

  // Re-subscribe when tokens change
  useEffect(() => {
    if (isConnected && tokensWithExchange.length > 0) {
      subscribeToTokens(tokensWithExchange);
    }
  }, [tokensWithExchange, isConnected, subscribeToTokens]);

  return {
    priceData,
    isConnected,
  };
}

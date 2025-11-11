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
        console.warn('[useMarketWatchWebSocket] Message has no msg property');
        return;
      }

      // Extract token from message
      const token = msg.instrumentToken || msg.token;
      if (!token) {
        console.warn('[useMarketWatchWebSocket] No token found in message');
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

      console.log('[useMarketWatchWebSocket] Updated price data:', {
        token,
        exchange: updatedData.exchange,
        ltp: updatedData.ltp,
        changePercent: updatedData.changePercent
      });

      setPriceData((prev) => {
        const newMap = new Map(prev);
        newMap.set(token, updatedData);
        return newMap;
      });
    } catch (error) {
      console.error('[useMarketWatchWebSocket] Error handling market data:', error);
    }
  }, []);

  // Helper function to normalize exchange code using comprehensive exchange config
  const normalizeExchangeCode = (exchange: string | number): number => {
    return getExchangeCode(exchange);
  };

  // Subscribe to tokens
  const subscribeToTokens = useCallback(async (tokensToSub: TokenWithExchange[]) => {
    if (!tokensToSub.length || !octopusInstance.isConnected()) {
      console.warn('[useMarketWatchWebSocket] WebSocket not ready for subscription', {
        tokensCount: tokensToSub.length,
        isConnected: octopusInstance.isConnected()
      });
      return;
    }

    console.log('[useMarketWatchWebSocket] Starting subscription for tokens:', {
      count: tokensToSub.length,
      tokens: tokensToSub.map(t => ({ token: t.token, exchange: t.exchange }))
    });

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
            console.log(`[useMarketWatchWebSocket] Unsubscribed from token: ${token}`);
          } catch (error) {
            console.error(`[useMarketWatchWebSocket] Error unsubscribing from ${token}:`, error);
          }
        }
      }
    }

    // Subscribe to new tokens with their own exchange codes
    for (const { token, exchange } of tokensToSub) {
      if (!subscriptionsRef.current.has(token)) {
        try {
          const numericExchangeCode = normalizeExchangeCode(exchange);
          console.log(`[useMarketWatchWebSocket] Attempting to subscribe to token: ${token} on exchange: ${exchange} (code: ${numericExchangeCode})`);
          
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
            console.log(`[useMarketWatchWebSocket] ✅ Successfully subscribed to token: ${token} on ${exchange} (code: ${numericExchangeCode})`);
          } else {
            console.error(`[useMarketWatchWebSocket] ❌ Handler is null for token: ${token}`);
          }
        } catch (error) {
          console.error(`[useMarketWatchWebSocket] ❌ Error subscribing to ${token}:`, error);
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
        console.log('[useMarketWatchWebSocket] Initializing WebSocket with tokens:', {
          count: tokensWithExchange.length,
          tokens: tokensWithExchange.map(t => ({ token: t.token, exchange: t.exchange }))
        });
        const connected = await octopusInstance.connect();
        
        if (!isMounted) return;
        
        console.log('[useMarketWatchWebSocket] Connection result:', connected);
        setIsConnected(connected);

        if (connected && tokensWithExchange.length > 0) {
          console.log('[useMarketWatchWebSocket] Connected - subscribing to', tokensWithExchange.length, 'tokens');
          await subscribeToTokens(tokensWithExchange);
          
          if (isMounted) {
            console.log('[useMarketWatchWebSocket] ✓ Subscriptions complete');
          }
        } else {
          console.warn('[useMarketWatchWebSocket] Not subscribing - connected:', connected, 'tokens:', tokensWithExchange.length);
        }
      } catch (error) {
        console.error('[useMarketWatchWebSocket] Connection error:', error);
        if (isMounted) {
          setIsConnected(false);
        }
      }
    };

    initializeWebSocket();

    // Cleanup function
    return () => {
      isMounted = false;
      console.log('[useMarketWatchWebSocket] Cleaning up - unsubscribing from', subscriptions.size, 'tokens');
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

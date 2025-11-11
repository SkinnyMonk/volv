'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import octopusInstance from '@/lib/octopus/octopusInstance';
import { getExchangeCode } from '@/lib/exchanges';

export interface OptionChainData {
  strike: number;
  callBid: number;
  callAsk: number;
  callVolume: number;
  callOpenInterest: number;
  callImpliedVolatility: number;
  callGreeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
  };
  putBid: number;
  putAsk: number;
  putVolume: number;
  putOpenInterest: number;
  putImpliedVolatility: number;
  putGreeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
  };
}

interface GreekDataMessage {
  topic: string;
  msg?: {
    instrumentToken?: string | number;
    token?: string | number;
    strikePrice?: number;
    strike_price?: number;
    optionType?: string;
    option_type?: string;
    impliedVolatility?: number;
    implied_volatility?: number;
    delta?: number;
    gamma?: number;
    theta?: number;
    vega?: number;
    rho?: number;
    bidPrice?: number;
    bid_price?: number;
    askPrice?: number;
    ask_price?: number;
    volume?: number;
    openInterest?: number;
    open_interest?: number;
    [key: string]: string | number | undefined;
  };
}

export function useOptionChainWebSocket(
  exchange: string = 'NSE',
  token: string | number = 26000
) {
  const [optionChain, setOptionChain] = useState<Map<number, OptionChainData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const subscriptionRef = useRef<(() => void) | null>(null);

  // Parse Greek data and organize by strike
  const handleGreekDataUpdate = useCallback((message: GreekDataMessage) => {
    try {
      const msg = message.msg;
      if (!msg) {
        console.warn('[useOptionChainWebSocket] Message has no msg property');
        return;
      }

      const strike = (msg.strikePrice || msg.strike_price) as number;
      const optionType = (msg.optionType || msg.option_type) as string;
      const iv = (msg.impliedVolatility || msg.implied_volatility || 0) as number;

      if (!strike || !optionType) {
        console.warn('[useOptionChainWebSocket] Missing strike or option type');
        return;
      }

      const greekData = {
        delta: (msg.delta || 0) as number,
        gamma: (msg.gamma || 0) as number,
        theta: (msg.theta || 0) as number,
        vega: (msg.vega || 0) as number,
        rho: (msg.rho || 0) as number,
      };

      const bidPrice = (msg.bidPrice || msg.bid_price || 0) as number;
      const askPrice = (msg.askPrice || msg.ask_price || 0) as number;
      const volume = (msg.volume || 0) as number;
      const openInterest = (msg.openInterest || msg.open_interest || 0) as number;

      setOptionChain((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(strike) || {
          strike,
          callBid: 0,
          callAsk: 0,
          callVolume: 0,
          callOpenInterest: 0,
          callImpliedVolatility: 0,
          callGreeks: { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 },
          putBid: 0,
          putAsk: 0,
          putVolume: 0,
          putOpenInterest: 0,
          putImpliedVolatility: 0,
          putGreeks: { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 },
        };

        if (optionType.toLowerCase() === 'ce' || optionType.toLowerCase() === 'call') {
          existing.callBid = bidPrice;
          existing.callAsk = askPrice;
          existing.callVolume = volume;
          existing.callOpenInterest = openInterest;
          existing.callImpliedVolatility = iv;
          existing.callGreeks = greekData;
        } else if (optionType.toLowerCase() === 'pe' || optionType.toLowerCase() === 'put') {
          existing.putBid = bidPrice;
          existing.putAsk = askPrice;
          existing.putVolume = volume;
          existing.putOpenInterest = openInterest;
          existing.putImpliedVolatility = iv;
          existing.putGreeks = greekData;
        }

        newMap.set(strike, existing);
        return newMap;
      });

      setLastUpdate(new Date());

      console.log('[useOptionChainWebSocket] Updated option chain:', {
        strike,
        optionType,
        iv,
        bid: bidPrice,
        ask: askPrice,
      });
    } catch (error) {
      console.error('[useOptionChainWebSocket] Error handling greek data:', error);
    }
  }, []);

  // Subscribe to option chain WebSocket
  const subscribeToOptionChain = useCallback(async () => {
    if (!octopusInstance.isConnected()) {
      console.warn('[useOptionChainWebSocket] WebSocket not ready for subscription');
      return;
    }

    try {
      const exchangeCode = getExchangeCode(exchange);
      console.log(`[useOptionChainWebSocket] Attempting to subscribe to option chain:`, {
        token,
        exchange,
        exchangeCode,
      });

      const handler = octopusInstance.wsHandler({
        messageType: 'GreekData',
        subscriptionLocation: '',
        payload: {
          exchangeCode,
          instrumentToken: token,
        },
      });

      if (handler) {
        await handler.subscribe((msg: unknown) => {
          handleGreekDataUpdate(msg as GreekDataMessage);
        });

        subscriptionRef.current = () => {
          void handler.unsubscribe();
        };

        console.log(`[useOptionChainWebSocket] ✅ Successfully subscribed to option chain`);
      } else {
        console.error(`[useOptionChainWebSocket] ❌ Handler is null for option chain`);
      }
    } catch (error) {
      console.error(`[useOptionChainWebSocket] ❌ Error subscribing to option chain:`, error);
    }
  }, [exchange, token, handleGreekDataUpdate]);

  // Connect WebSocket and subscribe to option chain
  useEffect(() => {
    let isMounted = true;

    const initializeWebSocket = async () => {
      try {
        console.log('[useOptionChainWebSocket] Initializing WebSocket for option chain');
        const connected = await octopusInstance.connect();

        if (!isMounted) return;

        console.log('[useOptionChainWebSocket] Connection result:', connected);
        setIsConnected(connected);

        if (connected) {
          await subscribeToOptionChain();
        }
      } catch (error) {
        console.error('[useOptionChainWebSocket] Error initializing WebSocket:', error);
        if (isMounted) {
          setIsConnected(false);
        }
      }
    };

    initializeWebSocket();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current();
        } catch (error) {
          console.error('[useOptionChainWebSocket] Error unsubscribing:', error);
        }
      }
    };
  }, [subscribeToOptionChain]);

  return {
    optionChain: Array.from(optionChain.values()).sort((a, b) => a.strike - b.strike),
    isConnected,
    lastUpdate,
  };
}

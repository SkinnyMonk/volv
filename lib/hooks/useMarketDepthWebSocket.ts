'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import octopusInstance from '@/lib/octopus/octopusInstance';
import { getExchangeCode } from '@/lib/exchanges';

export interface DepthLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface MarketDepthData {
  bids: DepthLevel[];
  asks: DepthLevel[];
  ltp?: number;
  bid?: number;
  ask?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  avgTradePrice?: number;
  totalBuyQty?: number;
  totalSellQty?: number;
}

interface DepthDataMessage {
  topic: string;
  msg?: {
    instrumentToken?: string | number;
    token?: string | number;
    msgType?: number;
    exchange?: string | number;
    buyer?: number[];
    bidPrices?: number[];
    bidQty?: number[];
    seller?: number[];
    askPrices?: number[];
    askQty?: number[];
    avgTradePrice?: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    totalBuyQty?: number;
    totalSellQty?: number;
    totalVolume?: number;
    [key: string]: string | number | number[] | undefined;
  };
}

export function useMarketDepthWebSocket(
  exchange: string = 'NSE',
  token: string | number = 3045 // SBIN token
) {
  const [depthData, setDepthData] = useState<MarketDepthData>({
    bids: [],
    asks: [],
    ltp: 0,
    bid: 0,
    ask: 0,
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0,
    avgTradePrice: 0,
    totalBuyQty: 0,
    totalSellQty: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const subscriptionRef = useRef<(() => void) | null>(null);

  // Parse market depth data from websocket message (SnapquoteDataMessage)
  const handleDepthDataUpdate = useCallback((message: DepthDataMessage) => {
    try {
      const msg = message.msg;
      if (!msg) {
        console.warn('[useMarketDepthWebSocket] Message has no msg property');
        return;
      }

      console.log('[useMarketDepthWebSocket] Full snapquote data:', msg);
      console.log('[useMarketDepthWebSocket] Message keys:', Object.keys(msg));

      // Extract arrays from snapquote data structure
      const bidPrices = (msg.bidPrices || []) as number[];
      const bidQty = (msg.bidQty || msg.bidQtys || []) as number[];
      const askPrices = (msg.askPrices || []) as number[];
      const askQty = (msg.askQty || msg.askQtys || []) as number[];
      const buyers = (msg.buyer || msg.buyers || []) as number[];
      const sellers = (msg.seller || msg.sellers || []) as number[];

      console.log('[useMarketDepthWebSocket] Buyers count:', buyers);
      console.log('[useMarketDepthWebSocket] Bid Prices:', bidPrices);
      console.log('[useMarketDepthWebSocket] Bid Qty:', bidQty);
      console.log('[useMarketDepthWebSocket] Sellers count:', sellers);
      console.log('[useMarketDepthWebSocket] Ask Prices:', askPrices);
      console.log('[useMarketDepthWebSocket] Ask Qty:', askQty);

      // Build bid levels from actual WebSocket data (5 levels)
      const bids: DepthLevel[] = bidPrices.map((price, idx) => ({
        price: price || 0,
        quantity: bidQty[idx] || 0,
        total: (price || 0) * (bidQty[idx] || 0),
      })).slice(0, 5);

      // Build ask levels from actual WebSocket data (5 levels)
      const asks: DepthLevel[] = askPrices.map((price, idx) => ({
        price: price || 0,
        quantity: askQty[idx] || 0,
        total: (price || 0) * (askQty[idx] || 0),
      })).slice(0, 5);

      const ltp = (msg.close || msg.avgTradePrice || 0) as number;
      const open = (msg.open || 0) as number;
      const high = (msg.high || 0) as number;
      const low = (msg.low || 0) as number;
      const volume = (msg.totalVolume || msg.volume || 0) as number;
      const totalBuyQty = (msg.totalBuyQty || bidQty.reduce((sum, q) => sum + (q || 0), 0)) as number;
      const totalSellQty = (msg.totalSellQty || askQty.reduce((sum, q) => sum + (q || 0), 0)) as number;

      console.log(`[useMarketDepthWebSocket] LTP: ${ltp}, O: ${open}, H: ${high}, L: ${low}, V: ${volume}`);
      console.log(`[useMarketDepthWebSocket] Total Buy Qty: ${totalBuyQty}, Total Sell Qty: ${totalSellQty}`);

      setDepthData({
        bids,
        asks,
        ltp,
        bid: bids[0]?.price || 0,
        ask: asks[0]?.price || 0,
        open,
        high,
        low,
        close: ltp,
        volume,
        avgTradePrice: (msg.avgTradePrice || 0) as number,
        totalBuyQty,
        totalSellQty,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('[useMarketDepthWebSocket] Error handling depth data:', error);
    }
  }, []);

  // Subscribe to market depth WebSocket
  const subscribeToMarketDepth = useCallback(async () => {
    if (!octopusInstance.isConnected()) {
      console.log('[useMarketDepthWebSocket] Not connected to websocket');
      return;
    }

    try {
      const exchangeCode = getExchangeCode(exchange);
      console.log(`[useMarketDepthWebSocket] Subscribing to snapquote data: Exchange=${exchange}, Token=${token}, ExchangeCode=${exchangeCode}`);

      const handler = octopusInstance.wsHandler({
        messageType: 'SnapquoteDataMessage',
        subscriptionLocation: '',
        payload: {
          exchangeCode,
          instrumentToken: token,
        },
      });

      if (handler) {
        await handler.subscribe((msg: unknown) => {
          handleDepthDataUpdate(msg as DepthDataMessage);
        });

        subscriptionRef.current = () => {
          void handler.unsubscribe();
        };
        console.log('[useMarketDepthWebSocket] Successfully subscribed to snapquote data');
      } else {
        console.warn('[useMarketDepthWebSocket] No handler returned from wsHandler');
      }
    } catch (error) {
      console.error('[useMarketDepthWebSocket] Error subscribing to snapquote data:', error);
    }
  }, [exchange, token, handleDepthDataUpdate]);

  // Connect WebSocket and subscribe to market depth
  useEffect(() => {
    let isMounted = true;

    const initializeWebSocket = async () => {
      try {
        console.log('[useMarketDepthWebSocket] Initializing websocket connection');
        const connected = await octopusInstance.connect();

        if (!isMounted) return;

        setIsConnected(connected);

        if (connected) {
          console.log('[useMarketDepthWebSocket] Connected to websocket, subscribing to market depth');
          await subscribeToMarketDepth();
        } else {
          console.warn('[useMarketDepthWebSocket] Failed to connect to websocket');
        }
      } catch (error) {
        if (isMounted) {
          console.error('[useMarketDepthWebSocket] Error initializing websocket:', error);
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
          console.error('[useMarketDepthWebSocket] Error unsubscribing:', error);
        }
      }
    };
  }, [subscribeToMarketDepth]);

  return {
    depthData,
    isConnected,
    lastUpdate,
  };
}

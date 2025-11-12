'use client';

import { formatINR } from '@/lib/currencyFormatter';
import { useMarketDepthWebSocket } from '@/lib/hooks/useMarketDepthWebSocket';

interface DepthData {
  bids: Array<{ price: number; quantity: number; total: number }>;
  asks: Array<{ price: number; quantity: number; total: number }>;
  ltp: number;
  bid: number;
  ask: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  avgTradePrice?: number;
  totalBuyQty?: number;
  totalSellQty?: number;
  bidPrices?: number[];
  bidQty?: number[];
  askPrices?: number[];
  askQty?: number[];
  buyers?: number[];
  sellers?: number[];
}

export default function MarketDepthWidget() {
  // Subscribe to SBIN market depth (NSE code: 3045)
  const { depthData, isConnected } = useMarketDepthWebSocket('NSE', 3045);

  const {
    bids = [],
    asks = [],
    ltp = 0,
    bid = 0,
    ask = 0,
    open = 0,
    high = 0,
    low = 0,
    close = 0,
    volume = 0,
    avgTradePrice = 0,
    totalBuyQty = 0,
    totalSellQty = 0,
  } = depthData as unknown as DepthData;

  // Log received data for debugging
  console.log('[MarketDepthWidget] Received depth data:', {
    ltp,
    open,
    high,
    low,
    close,
    volume,
    avgTradePrice,
    totalBuyQty,
    totalSellQty,
    bidsCount: bids.length,
    asksCount: asks.length,
  });
  
  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-400 text-xs">Connecting to SBIN...</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalBidQty = bids.reduce((sum, b) => sum + b.quantity, 0);
  const totalAskQty = asks.reduce((sum, a) => sum + a.quantity, 0);
  const bidBidPricePercentage = bid > 0 ? ((bid / ltp) * 100).toFixed(2) : '0.00';
  const askAskPricePercentage = ask > 0 ? ((ask / ltp) * 100).toFixed(2) : '0.00';

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white border-opacity-10 shrink-0 bg-slate-800">
        <div className="flex justify-between items-center gap-2">
          <p className="text-white text-xs font-semibold">SBIN</p>
          <span className="text-green-400 text-sm font-bold">{formatINR(ltp)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        
      

    

        {/* Combined Table - All 5 Levels */}
        <div className="space-y-1">
          <div className="border border-gray-600 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-700">
                <tr>
                  <th className="text-green-400 px-2 py-1 text-right">Bid Qty</th>
                  <th className="text-green-400 px-2 py-1 text-right">Bid Price</th>
                  <th className="text-red-400 px-2 py-1 text-right">Ask Price</th>
                  <th className="text-red-400 px-2 py-1 text-right">Ask Qty</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-t border-gray-700 hover:bg-slate-700">
                    <td className="text-gray-300 px-2 py-1 text-right">
                      {bids[idx]?.quantity || 0}
                    </td>
                    <td className="text-green-400 px-2 py-1 text-right font-semibold">
                      {bids[idx]?.price || 0}
                    </td>
                    <td className="text-red-400 px-2 py-1 text-right font-semibold">
                      {asks[idx]?.price || 0}
                    </td>
                    <td className="text-gray-300 px-2 py-1 text-right">
                      {asks[idx]?.quantity || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="grid grid-cols-2 gap-2 bg-slate-800 p-2 rounded">
          <div className="space-y-1">
            <p className="text-gray-400 text-xs">Total Bid:</p>
            <p className="text-green-400 font-semibold">{formatINR(totalBidQty)}</p>
            <p className="text-gray-500 text-xs">{bidBidPricePercentage}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-xs">Total Ask:</p>
            <p className="text-red-400 font-semibold">{formatINR(totalAskQty)}</p>
            <p className="text-gray-500 text-xs">{askAskPricePercentage}%</p>
          </div>
        </div>

        {/* Market Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* High */}
          <div className="bg-slate-800 p-2 rounded">
            <p className="text-gray-400">High:</p>
            <p className="text-white font-semibold">{high ? high.toFixed(2) : '-'}</p>
          </div>

          {/* Open */}
          <div className="bg-slate-800 p-2 rounded">
            <p className="text-gray-400">Open:</p>
            <p className="text-white font-semibold">{open ? open.toFixed(2) : '-'}</p>
          </div>

          {/* Upper Circuit */}
          <div className="bg-slate-800 p-2 rounded">
            <p className="text-gray-400">Upper Circuit:</p>
            <p className="text-white font-semibold">{high ? (high * 1.10).toFixed(2) : '-'}</p>
          </div>

          {/* Volume */}
          <div className="bg-slate-800 p-2 rounded">
            <p className="text-gray-400">Volume:</p>
            <p className="text-white font-semibold">{volume ? formatINR(volume) : '-'}</p>
          </div>

          {/* Low */}
          <div className="bg-slate-800 p-2 rounded">
            <p className="text-gray-400">Low:</p>
            <p className="text-white font-semibold">{low ? low.toFixed(2) : '-'}</p>
          </div>

          {/* Close */}
          <div className="bg-slate-800 p-2 rounded">
            <p className="text-gray-400">Close:</p>
            <p className="text-white font-semibold">{close ? close.toFixed(2) : '-'}</p>
          </div>

          {/* Lower Circuit */}
          <div className="bg-slate-800 p-2 rounded">
            <p className="text-gray-400">Lower Circuit:</p>
            <p className="text-white font-semibold">{low ? (low * 0.90).toFixed(2) : '-'}</p>
          </div>

          {/* Avg. Trade Price */}
          <div className="bg-slate-800 p-2 rounded">
            <p className="text-gray-400">Avg. Trade Price:</p>
            <p className="text-white font-semibold">{avgTradePrice ? avgTradePrice.toFixed(2) : '0.00'}</p>
          </div>

          {/* LTT */}
          <div className="bg-slate-800 p-2 rounded col-span-2">
            <p className="text-gray-400">LTT:</p>
            <p className="text-white font-semibold">{ltp ? new Date().toLocaleTimeString() : '-'}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

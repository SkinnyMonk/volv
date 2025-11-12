'use client';

import { useMemo } from 'react';
import { formatINR } from '@/lib/currencyFormatter';

// Hardcoded Nifty 50 option chain data
const HARDCODED_OPTION_CHAIN = [
  { strike: 23500, callBid: 1245.50, callAsk: 1248.75, callVolume: 2340, callOpenInterest: 45000, putBid: 0.15, putAsk: 0.25, putVolume: 105, putOpenInterest: 18000 },
  { strike: 23600, callBid: 1155.25, callAsk: 1158.50, callVolume: 1890, callOpenInterest: 38000, putBid: 0.25, putAsk: 0.35, putVolume: 210, putOpenInterest: 22000 },
  { strike: 23700, callBid: 1065.75, callAsk: 1069.00, callVolume: 2150, callOpenInterest: 52000, putBid: 0.50, putAsk: 0.65, putVolume: 315, putOpenInterest: 28000 },
  { strike: 23800, callBid: 976.50, callAsk: 979.75, callVolume: 2890, callOpenInterest: 61000, putBid: 1.05, putAsk: 1.25, putVolume: 525, putOpenInterest: 35000 },
  { strike: 23900, callBid: 888.25, callAsk: 891.50, callVolume: 3450, callOpenInterest: 72000, putBid: 2.15, putAsk: 2.45, putVolume: 840, putOpenInterest: 48000 },
  { strike: 24000, callBid: 800.75, callAsk: 804.00, callVolume: 4120, callOpenInterest: 85000, putBid: 4.50, putAsk: 5.10, putVolume: 1230, putOpenInterest: 62000 },
  { strike: 24100, callBid: 715.50, callAsk: 718.75, callVolume: 3890, callOpenInterest: 78000, putBid: 8.25, putAsk: 9.15, putVolume: 1890, putOpenInterest: 72000 },
  { strike: 24200, callBid: 632.25, callAsk: 635.50, callVolume: 3210, callOpenInterest: 68000, putBid: 14.50, putAsk: 16.25, putVolume: 2450, putOpenInterest: 81000 },
  { strike: 24300, callBid: 551.00, callAsk: 554.25, callVolume: 2780, callOpenInterest: 55000, putBid: 24.75, putAsk: 27.25, putVolume: 2890, putOpenInterest: 85000 },
  { strike: 24400, callBid: 472.75, callAsk: 476.00, callVolume: 2340, callOpenInterest: 42000, putBid: 38.50, putAsk: 42.00, putVolume: 3120, putOpenInterest: 88000 },
  { strike: 24500, callBid: 397.50, callAsk: 400.75, callVolume: 4560, callOpenInterest: 95000, putBid: 55.25, putAsk: 59.75, putVolume: 5680, putOpenInterest: 125000 },
  { strike: 24600, callBid: 325.25, callAsk: 328.50, callVolume: 3780, callOpenInterest: 82000, putBid: 75.50, putAsk: 81.00, putVolume: 4230, putOpenInterest: 98000 },
  { strike: 24700, callBid: 256.00, callAsk: 259.25, callVolume: 2910, callOpenInterest: 65000, putBid: 99.75, putAsk: 106.50, putVolume: 3120, putOpenInterest: 78000 },
  { strike: 24800, callBid: 190.75, callAsk: 194.00, callVolume: 2450, callOpenInterest: 48000, putBid: 128.25, putAsk: 136.25, putVolume: 2340, putOpenInterest: 58000 },
  { strike: 24900, callBid: 129.50, callAsk: 132.75, callVolume: 1890, callOpenInterest: 35000, putBid: 160.75, putAsk: 170.25, putVolume: 1680, putOpenInterest: 42000 },
  { strike: 25000, callBid: 72.25, callAsk: 75.50, callVolume: 1340, callOpenInterest: 25000, putBid: 197.50, putAsk: 208.50, putVolume: 1120, putOpenInterest: 28000 },
  { strike: 25100, callBid: 35.50, callAsk: 38.75, callVolume: 890, callOpenInterest: 15000, putBid: 238.75, putAsk: 251.50, putVolume: 780, putOpenInterest: 18000 },
  { strike: 25200, callBid: 15.25, callAsk: 18.50, callVolume: 450, callOpenInterest: 8000, putBid: 283.50, putAsk: 297.75, putVolume: 420, putOpenInterest: 10000 },
];

export default function OptionChainWidget() {
  // Use hardcoded data
  const optionChain = HARDCODED_OPTION_CHAIN;

  // Calculate ATM strike - find strike with highest open interest
  const atmStrike = useMemo(() => {
    if (optionChain.length === 0) return 24500;
    
    // Find strike where call and put are most liquid
    let closestStrike = optionChain[0].strike;
    let maxTotalOI = 0;

    for (const row of optionChain) {
      const totalOI = row.callOpenInterest + row.putOpenInterest;
      if (totalOI > maxTotalOI) {
        maxTotalOI = totalOI;
        closestStrike = row.strike;
      }
    }

    return closestStrike;
  }, [optionChain]);

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white border-opacity-10 shrink-0">
        <p className="text-white text-xs font-semibold truncate">NIFTY 50 Options Chain</p>
        <p className="text-gray-400 text-xs mt-1 truncate">Expiry: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Table Container - Horizontal Scrollable - Fully responsive */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-w-0">
        {optionChain.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <span className="text-gray-400 text-xs">Connecting to real-time data...</span>
            </div>
          </div>
        ) : (
          <div className="min-w-full text-xs">
            {/* Headers - Sticky */}
            <div className="sticky top-0 flex bg-slate-700 border-b border-white border-opacity-10 shrink-0">
              <div className="flex-1 min-w-12 text-center py-2 px-1 border-r border-white border-opacity-5">
                <p className="text-gray-400 font-semibold text-xs">CB</p>
              </div>
              <div className="flex-1 min-w-12 text-center py-2 px-1 border-r border-white border-opacity-5">
                <p className="text-gray-400 font-semibold text-xs">CA</p>
              </div>
              <div className="flex-1 min-w-10 text-center py-2 px-1 border-r border-white border-opacity-5">
                <p className="text-gray-400 font-semibold text-xs">CV</p>
              </div>
              <div className="flex-1 min-w-10 text-center py-2 px-1 border-r border-white border-opacity-5">
                <p className="text-gray-400 font-semibold text-xs">COI</p>
              </div>
              <div className="flex-1 min-w-14 text-center py-2 px-1 border-r border-l border-white border-opacity-10 bg-slate-800">
                <p className="text-white font-bold text-xs">Strk</p>
              </div>
              <div className="flex-1 min-w-12 text-center py-2 px-1 border-r border-white border-opacity-5">
                <p className="text-gray-400 font-semibold text-xs">PB</p>
              </div>
              <div className="flex-1 min-w-12 text-center py-2 px-1 border-r border-white border-opacity-5">
                <p className="text-gray-400 font-semibold text-xs">PA</p>
              </div>
              <div className="flex-1 min-w-10 text-center py-2 px-1 border-r border-white border-opacity-5">
                <p className="text-gray-400 font-semibold text-xs">PV</p>
              </div>
              <div className="flex-1 min-w-10 text-center py-2 px-1">
                <p className="text-gray-400 font-semibold text-xs">POI</p>
              </div>
            </div>

            {/* Table Body */}
            {optionChain.map((row) => (
              <div
                key={row.strike}
                className={`flex border-b border-white border-opacity-5 hover:bg-slate-700 hover:bg-opacity-30 transition ${
                  row.strike === atmStrike ? 'bg-blue-900 bg-opacity-20' : ''
                }`}
              >
                <div className="flex-1 min-w-12 text-center py-1.5 px-1 text-green-400 text-xs truncate">{row.callBid.toFixed(2)}</div>
                <div className="flex-1 min-w-12 text-center py-1.5 px-1 text-red-400 text-xs truncate">{row.callAsk.toFixed(2)}</div>
                <div className="flex-1 min-w-10 text-center py-1.5 px-1 text-gray-300 text-xs truncate">{row.callVolume}</div>
                <div className="flex-1 min-w-10 text-center py-1.5 px-1 text-gray-300 text-xs truncate">{row.callOpenInterest}</div>
                <div className="flex-1 min-w-14 text-center py-1.5 px-1 text-white font-bold border-l border-r border-white border-opacity-10 bg-slate-900 bg-opacity-50 text-xs truncate">{formatINR(row.strike)}</div>
                <div className="flex-1 min-w-12 text-center py-1.5 px-1 text-green-400 text-xs truncate">{row.putBid.toFixed(2)}</div>
                <div className="flex-1 min-w-12 text-center py-1.5 px-1 text-red-400 text-xs truncate">{row.putAsk.toFixed(2)}</div>
                <div className="flex-1 min-w-10 text-center py-1.5 px-1 text-gray-300 text-xs truncate">{row.putVolume}</div>
                <div className="flex-1 min-w-10 text-center py-1.5 px-1 text-gray-300 text-xs truncate">{row.putOpenInterest}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

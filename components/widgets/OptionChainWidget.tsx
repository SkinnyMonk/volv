'use client';

import { useMemo } from 'react';
import { formatINR } from '@/lib/currencyFormatter';
import { useOptionChainWebSocket } from '@/lib/hooks/useOptionChainWebSocket';

export default function OptionChainWidget() {
  const { optionChain } = useOptionChainWebSocket(
    'NSE', // Exchange: NSE
    26000  // Nifty 50 instrument token
  );

  // Calculate ATM strike - find strike closest to midpoint of call/put spreads
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

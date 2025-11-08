'use client';

import { useMemo } from 'react';

interface OptionChain {
  strike: number;
  callBid: number;
  callAsk: number;
  callVolume: number;
  callOpenInterest: number;
  putBid: number;
  putAsk: number;
  putVolume: number;
  putOpenInterest: number;
}

const generateMockOptionChain = (): OptionChain[] => {
  const data: OptionChain[] = [];
  const atmStrike = 150;
  
  for (let i = -10; i <= 10; i++) {
    const strike = atmStrike + i;
    
    data.push({
      strike,
      callBid: Math.max(0.01, 10 - Math.abs(i) * 0.5),
      callAsk: Math.max(0.01, 10.5 - Math.abs(i) * 0.5),
      callVolume: Math.floor(Math.random() * 5000) + 100,
      callOpenInterest: Math.floor(Math.random() * 10000) + 500,
      putBid: Math.max(0.01, Math.abs(i) * 0.5),
      putAsk: Math.max(0.01, Math.abs(i) * 0.5 + 0.5),
      putVolume: Math.floor(Math.random() * 5000) + 100,
      putOpenInterest: Math.floor(Math.random() * 10000) + 500,
    });
  }
  
  return data;
};

export default function OptionChainWidget() {
  const optionChain = useMemo(() => generateMockOptionChain(), []);
  const atmStrike = 150;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white border-opacity-10">
        <p className="text-white text-xs font-semibold">AAPL Options Chain</p>
        <p className="text-gray-400 text-xs mt-1">Expiry: Jan 20, 2025</p>
      </div>

      {/* Table Container - Horizontal Scrollable */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-full text-xs">
          {/* Headers - Sticky */}
          <div className="sticky top-0 flex bg-slate-700 border-b border-white border-opacity-10">
            <div className="w-16 shrink-0 text-center py-2 px-1 border-r border-white border-opacity-5">
              <p className="text-gray-400 font-semibold text-xs">CB</p>
            </div>
            <div className="w-16 shrink-0 text-center py-2 px-1 border-r border-white border-opacity-5">
              <p className="text-gray-400 font-semibold text-xs">CA</p>
            </div>
            <div className="w-16 shrink-0 text-center py-2 px-1 border-r border-white border-opacity-5">
              <p className="text-gray-400 font-semibold text-xs">CV</p>
            </div>
            <div className="w-16 shrink-0 text-center py-2 px-1 border-r border-white border-opacity-5">
              <p className="text-gray-400 font-semibold text-xs">COI</p>
            </div>
            <div className="w-20 shrink-0 text-center py-2 px-1 border-r border-l border-white border-opacity-10 bg-slate-800">
              <p className="text-white font-bold text-xs">Strike</p>
            </div>
            <div className="w-16 shrink-0 text-center py-2 px-1 border-r border-white border-opacity-5">
              <p className="text-gray-400 font-semibold text-xs">PB</p>
            </div>
            <div className="w-16 shrink-0 text-center py-2 px-1 border-r border-white border-opacity-5">
              <p className="text-gray-400 font-semibold text-xs">PA</p>
            </div>
            <div className="w-16 shrink-0 text-center py-2 px-1 border-r border-white border-opacity-5">
              <p className="text-gray-400 font-semibold text-xs">PV</p>
            </div>
            <div className="w-16 shrink-0 text-center py-2 px-1">
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
              <div className="w-16 shrink-0 text-center py-1.5 px-1 text-green-400 text-xs">{row.callBid.toFixed(2)}</div>
              <div className="w-16 shrink-0 text-center py-1.5 px-1 text-red-400 text-xs">{row.callAsk.toFixed(2)}</div>
              <div className="w-16 shrink-0 text-center py-1.5 px-1 text-gray-300 text-xs">{row.callVolume}</div>
              <div className="w-16 shrink-0 text-center py-1.5 px-1 text-gray-300 text-xs">{row.callOpenInterest}</div>
              <div className="w-20 shrink-0 text-center py-1.5 px-1 text-white font-bold border-l border-r border-white border-opacity-10 bg-slate-900 bg-opacity-50 text-xs">${row.strike}</div>
              <div className="w-16 shrink-0 text-center py-1.5 px-1 text-green-400 text-xs">{row.putBid.toFixed(2)}</div>
              <div className="w-16 shrink-0 text-center py-1.5 px-1 text-red-400 text-xs">{row.putAsk.toFixed(2)}</div>
              <div className="w-16 shrink-0 text-center py-1.5 px-1 text-gray-300 text-xs">{row.putVolume}</div>
              <div className="w-16 shrink-0 text-center py-1.5 px-1 text-gray-300 text-xs">{row.putOpenInterest}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

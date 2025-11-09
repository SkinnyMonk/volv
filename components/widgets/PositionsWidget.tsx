'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR } from '@/lib/currencyFormatter';

interface Position {
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

const generateMockPositions = (): Position[] => {
  return [
    { symbol: 'TCS', qty: 100, avgPrice: 3650.00, currentPrice: 3745.50, pnl: 9550, pnlPercent: 2.61 },
    { symbol: 'INFY', qty: 50, avgPrice: 2905.00, currentPrice: 2890.25, pnl: -735, pnlPercent: -0.51 },
    { symbol: 'RELIANCE', qty: 30, avgPrice: 2830.00, currentPrice: 2925.80, pnl: 2874, pnlPercent: 3.37 },
    { symbol: 'HDFC', qty: 25, avgPrice: 2338.00, currentPrice: 2415.60, pnl: 1940, pnlPercent: 3.31 },
    { symbol: 'SBIN', qty: 40, avgPrice: 642.00, currentPrice: 685.20, pnl: 1728, pnlPercent: 6.72 },
  ];
};

export default function PositionsWidget() {
  const positions = useMemo(() => generateMockPositions(), []);
  const totalPnl = useMemo(() => positions.reduce((sum, p) => sum + p.pnl, 0), [positions]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white border-opacity-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white text-xs font-semibold">Positions</p>
            <p className="text-gray-400 text-xs mt-1">{positions.length} symbols</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
            </p>
            <p className="text-gray-400 text-xs">Total P&L</p>
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1 p-2">
          {positions.map((position) => (
            <div
              key={position.symbol}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 rounded hover:bg-slate-700 hover:bg-opacity-30 transition border border-white border-opacity-5"
            >
              {/* Symbol & Qty */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{position.symbol}</p>
                <p className="text-gray-400 text-xs truncate">{position.qty} @ {formatINR(position.avgPrice)}</p>
              </div>

              {/* P&L Display */}
              <div className="text-right flex-1 sm:flex-none">
                <div className="flex items-center gap-1 justify-end sm:justify-start">
                  {position.pnlPercent >= 0 ? (
                    <TrendingUp size={12} className="text-green-400 shrink-0" />
                  ) : (
                    <TrendingDown size={12} className="text-red-400 shrink-0" />
                  )}
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(0)}
                    </p>
                    <p className={`text-xs ${position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="px-3 py-2 border-t border-white border-opacity-10 flex justify-between text-xs">
        <span className="text-gray-400">Total Value</span>
        <span className="text-white font-semibold">{formatINR(9000000)}</span>
      </div>
    </div>
  );
}

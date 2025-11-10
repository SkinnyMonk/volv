'use client';

import { useMemo } from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR } from '@/lib/currencyFormatter';

interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  isFavorite: boolean;
}

const generateMockWatchlist = (): WatchlistItem[] => {
  return [
    { symbol: 'TCS', price: 3745.50, change: 85.75, changePercent: 2.35, volume: 5200000, isFavorite: true },
    { symbol: 'INFY', price: 2890.25, change: -15.50, changePercent: -0.53, volume: 3100000, isFavorite: true },
    { symbol: 'RELIANCE', price: 2925.80, change: 95.30, changePercent: 3.37, volume: 1800000, isFavorite: false },
    { symbol: 'HDFC', price: 2415.60, change: 78.10, changePercent: 3.34, volume: 2200000, isFavorite: false },
    { symbol: 'ICICIBANK', price: 1088.45, change: -38.90, changePercent: -3.45, volume: 4500000, isFavorite: true },
    { symbol: 'SBIN', price: 685.20, change: 42.30, changePercent: 6.58, volume: 3400000, isFavorite: false },
  ];
};

export default function MarketWatchWidget() {
  const watchlist = useMemo(() => generateMockWatchlist(), []);

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white border-opacity-10 shrink-0">
        <p className="text-white text-xs font-semibold truncate">Market Watch</p>
      </div>

      {/* Watchlist Table - Fully responsive */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-w-0">
        <div className="min-w-full text-xs">
          {/* Header Row */}
          <div className="sticky top-0 flex bg-slate-700 border-b border-white border-opacity-10 shrink-0">
            <div className="flex-1 min-w-12 px-2 py-2 text-gray-400 font-semibold border-r border-white border-opacity-5 text-center">★</div>
            <div className="flex-1 min-w-16 px-2 py-2 text-gray-400 font-semibold border-r border-white border-opacity-5">Sym</div>
            <div className="flex-1 min-w-16 px-2 py-2 text-gray-400 font-semibold border-r border-white border-opacity-5 text-right">Price</div>
            <div className="flex-1 min-w-16 px-2 py-2 text-gray-400 font-semibold border-r border-white border-opacity-5 text-right">Chg</div>
            <div className="flex-1 min-w-12 px-2 py-2 text-gray-400 font-semibold text-right">%</div>
          </div>

          {/* Data Rows */}
          {watchlist.map((item) => (
            <div
              key={item.symbol}
              className="flex border-b border-white border-opacity-5 hover:bg-slate-700 hover:bg-opacity-30 transition"
            >
              <div className="flex-1 min-w-12 px-2 py-2 flex items-center justify-center shrink-0">
                <button className="p-0.5 hover:opacity-80 transition">
                  <Star
                    size={12}
                    className={item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
                  />
                </button>
              </div>
              <div className="flex-1 min-w-16 px-2 py-2 text-white font-semibold truncate">{item.symbol}</div>
              <div className="flex-1 min-w-16 px-2 py-2 text-white font-semibold text-right truncate">{formatINR(item.price)}</div>
              <div className={`flex-1 min-w-16 px-2 py-2 font-semibold flex items-center justify-end gap-1 ${
                item.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.change >= 0 ? (
                  <TrendingUp size={10} className="shrink-0" />
                ) : (
                  <TrendingDown size={10} className="shrink-0" />
                )}
                <span className="truncate">{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
              </div>
              <div className={`flex-1 min-w-12 px-2 py-2 font-semibold text-right truncate ${
                item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white border-opacity-10 bg-slate-700 bg-opacity-50 shrink-0">
        <p className="text-gray-400 text-xs truncate">{watchlist.length} symbols</p>
      </div>
    </div>
  );
}

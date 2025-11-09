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
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white border-opacity-10">
        <p className="text-white text-xs font-semibold">Market Watch</p>
      </div>

      {/* Watchlist Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-max text-xs">
          {/* Header Row */}
          <div className="sticky top-0 flex bg-slate-700 border-b border-white border-opacity-10">
            <div className="w-16 shrink-0 px-3 py-2 text-gray-400 font-semibold border-r border-white border-opacity-5">Star</div>
            <div className="w-16 shrink-0 px-3 py-2 text-gray-400 font-semibold border-r border-white border-opacity-5">Symbol</div>
            <div className="w-16 shrink-0 px-3 py-2 text-gray-400 font-semibold border-r border-white border-opacity-5">Price</div>
            <div className="w-16 shrink-0 px-3 py-2 text-gray-400 font-semibold border-r border-white border-opacity-5">Change</div>
            <div className="w-16 shrink-0 px-3 py-2 text-gray-400 font-semibold">%</div>
          </div>

          {/* Data Rows */}
          {watchlist.map((item) => (
            <div
              key={item.symbol}
              className="flex border-b border-white border-opacity-5 hover:bg-slate-700 hover:bg-opacity-30 transition"
            >
              <div className="w-16 shrink-0 px-3 py-2 flex items-center justify-center">
                <button className="p-0.5 hover:opacity-80 transition">
                  <Star
                    size={12}
                    className={item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
                  />
                </button>
              </div>
              <div className="w-16 shrink-0 px-3 py-2 text-white font-semibold">{item.symbol}</div>
              <div className="w-16 shrink-0 px-3 py-2 text-white font-semibold">{formatINR(item.price)}</div>
              <div className={`w-16 shrink-0 px-3 py-2 font-semibold flex items-center gap-1 ${
                item.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.change >= 0 ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                <span>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
              </div>
              <div className={`w-16 shrink-0 px-3 py-2 font-semibold ${
                item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white border-opacity-10 bg-slate-700 bg-opacity-50">
        <p className="text-gray-400 text-xs">{watchlist.length} symbols</p>
      </div>
    </div>
  );
}

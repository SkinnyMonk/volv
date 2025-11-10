'use client';

import { useMemo } from 'react';
import { formatINR } from '@/lib/currencyFormatter';

interface DepthLevel {
  price: number;
  quantity: number;
  total: number;
}

const generateMockDepth = (): { bids: DepthLevel[]; asks: DepthLevel[] } => {
  const basePrice = 3745.25;
  const bids: DepthLevel[] = [];
  const asks: DepthLevel[] = [];

  for (let i = 1; i <= 8; i++) {
    const bidPrice = basePrice - i * 0.5;
    const askPrice = basePrice + i * 0.5;
    const quantity = Math.floor(Math.random() * 5000) + 1000;

    bids.push({
      price: bidPrice,
      quantity,
      total: bidPrice * quantity,
    });

    asks.push({
      price: askPrice,
      quantity: Math.floor(Math.random() * 5000) + 1000,
      total: askPrice * (Math.floor(Math.random() * 5000) + 1000),
    });
  }

  return { bids: bids.reverse(), asks };
};

export default function MarketDepthWidget() {
  const { bids, asks } = useMemo(() => generateMockDepth(), []);
  const maxQuantity = Math.max(
    ...bids.map(b => b.quantity),
    ...asks.map(a => a.quantity)
  );

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white border-opacity-10 shrink-0">
        <div className="flex justify-between items-center gap-2">
          <p className="text-white text-xs font-semibold truncate">Market Depth - TCS</p>
          <span className="text-green-400 text-xs font-semibold shrink-0">{formatINR(3745.25)}</span>
        </div>
      </div>

      {/* Content Container - Fully responsive */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-2 gap-0 h-full min-h-full">
          {/* Bids (Left) */}
          <div className="border-r border-white border-opacity-10 overflow-y-auto">
            <div className="sticky top-0 bg-slate-700 px-2 py-1 border-b border-white border-opacity-10 shrink-0">
              <p className="text-gray-400 text-xs font-semibold">Bids</p>
            </div>
            <div className="space-y-0.5 p-2">
              {bids.map((bid, idx) => (
                <div key={idx} className="relative h-5 flex items-center min-w-0">
                  {/* Background bar */}
                  <div
                    className="absolute right-0 top-0 h-full bg-green-900 bg-opacity-20 rounded transition-all"
                    style={{
                      width: `${(bid.quantity / maxQuantity) * 100}%`,
                    }}
                  />
                  
                  {/* Text content */}
                  <div className="relative z-10 w-full px-1 flex justify-between items-center text-xs gap-1 min-w-0">
                    <span className="text-green-400 font-semibold truncate">{formatINR(bid.price)}</span>
                    <span className="text-gray-300 truncate">{bid.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asks (Right) */}
          <div className="overflow-y-auto">
            <div className="sticky top-0 bg-slate-700 px-2 py-1 border-b border-white border-opacity-10 shrink-0">
              <p className="text-gray-400 text-xs font-semibold">Asks</p>
            </div>
            <div className="space-y-0.5 p-2">
              {asks.map((ask, idx) => (
                <div key={idx} className="relative h-5 flex items-center min-w-0">
                  {/* Background bar */}
                  <div
                    className="absolute left-0 top-0 h-full bg-red-900 bg-opacity-20 rounded transition-all"
                    style={{
                      width: `${(ask.quantity / maxQuantity) * 100}%`,
                    }}
                  />
                  
                  {/* Text content */}
                  <div className="relative z-10 w-full px-1 flex justify-between items-center text-xs gap-1 min-w-0">
                    <span className="text-gray-300 truncate">{ask.quantity}</span>
                    <span className="text-red-400 font-semibold truncate">{formatINR(ask.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

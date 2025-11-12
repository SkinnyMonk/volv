'use client';

import { useMarketWatches } from '@/lib/hooks/useMarketWatches';
import { useMarketWatchWebSocket } from '@/lib/hooks/useMarketWatchWebSocket';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useMemo } from 'react';

export default function MarketWatchWidget() {
  const { marketWatches, selectedWatch, selectedWatchId, setSelectedWatchId, loading, error } = useMarketWatches();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get tokens with their exchange codes from selected watch
  const tokensWithExchange = useMemo(() => {
    return selectedWatch?.instruments?.map((i) => ({
      token: i.token,
      exchange: i.exchange || 'NSE',
    })) || [];
  }, [selectedWatch]);

  // Subscribe to WebSocket for real-time data
  const { priceData } = useMarketWatchWebSocket(tokensWithExchange);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-950 bg-opacity-20 border border-red-800 rounded-lg p-4">
        <p className="text-red-300 text-xs">Error: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-400 text-xs">Loading...</span>
      </div>
    );
  }

  if (marketWatches.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
        No market watches found
      </div>
    );
  }

  const instruments = selectedWatch?.instruments || [];

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Market Watch Tabs */}
      <div className="relative flex items-center border-b border-white border-opacity-10 shrink-0 bg-gray-900 bg-opacity-50">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 p-1 bg-gray-900 hover:bg-gray-800 transition"
        >
          <ChevronLeft size={14} className="text-gray-400" />
        </button>

        {/* Tabs Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide pl-6 pr-6"
        >
          <div className="flex gap-0">
            {marketWatches.map((watch) => (
              <button
                key={watch.id}
                onClick={() => setSelectedWatchId(watch.id)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                  selectedWatchId === watch.id
                    ? 'text-white border-blue-500'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                {watch.name}
                <span className="text-xs text-gray-500 ml-1">({watch.instruments.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 p-1 bg-gray-900 hover:bg-gray-800 transition"
        >
          <ChevronRight size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Selected Watch Header with WebSocket Status */}
      {selectedWatch && (
        <div className="px-3 py-2 border-b border-white border-opacity-10 shrink-0 bg-gray-800 bg-opacity-30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xs font-semibold">{selectedWatch.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">{instruments.length} instruments</p>
            </div>
          </div>
        </div>
      )}

      {/* Instruments List */}
      {instruments.length > 0 ? (
        <div className="flex-1 overflow-x-auto overflow-y-auto min-w-0">
          <div className="space-y-1 p-2">
            {instruments.map((instrument) => {
              const liveData = priceData.get(instrument.token);
              const hasData = liveData !== undefined;
              let changePercent = 0;
              
              // Handle NaN, Infinity, null, undefined values for changePercent
              if (hasData && liveData.changePercent !== undefined && liveData.changePercent !== null) {
                if (!isNaN(liveData.changePercent) && isFinite(liveData.changePercent)) {
                  changePercent = liveData.changePercent;
                } else {
                  changePercent = 0;
                }
              }
              
              const isPositive = changePercent > 0;
              const ltp = liveData?.ltp;
              const isIndex = instrument.index;
              
              return (
                <div
                  key={instrument.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 hover:bg-opacity-30 transition border border-white border-opacity-5 group"
                >
                  {/* Instrument Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                      <p className="text-white text-xs font-semibold truncate">
                        {instrument.display_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                      <span className="truncate">{instrument.description}</span>
                      <span className="shrink-0 font-medium text-gray-400">{instrument.exchange}</span>
                    </div>
                  </div>

                  {/* Live Price Data - Always visible */}
                  <div className="text-right shrink-0 min-w-28">
                    <p className="text-white text-xs font-semibold">
                      {ltp && ltp > 0 ? `₹${ltp.toFixed(2)}` : '-'}
                    </p>
                    <p className={`text-xs font-medium ${
                      isPositive ? 'text-green-400' : changePercent === 0 ? 'text-gray-400' : 'text-red-400'
                    }`}>
                      {`${isPositive && changePercent !== 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
                    </p>
                  </div>

                  {/* Hover Action Buttons - Only show on hover for this specific row */}
                  {/* <div className="hidden group-hover:flex items-center gap-1 shrink-0 flex-wrap justify-start">
                    {!isIndex && (
                      <>
                        <button className="px-2 py-1 text-xs bg-green-900 bg-opacity-40 text-green-300 rounded hover:bg-opacity-60 transition">
                          Buy
                        </button>
                        <button className="px-2 py-1 text-xs bg-red-900 bg-opacity-40 text-red-300 rounded hover:bg-opacity-60 transition">
                          Sell
                        </button>
                      </>
                    )}
                    <button className="px-2 py-1 text-xs bg-blue-900 bg-opacity-40 text-blue-300 rounded hover:bg-opacity-60 transition">
                      Know More
                    </button>
                    <button className="px-2 py-1 text-xs bg-purple-900 bg-opacity-40 text-purple-300 rounded hover:bg-opacity-60 transition">
                      Depth
                    </button>
                  </div> */}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
          No instruments in {selectedWatch?.name}
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white border-opacity-10 bg-slate-700 bg-opacity-50 shrink-0">
        <p className="text-gray-400 text-xs truncate">{instruments.length} symbols in {selectedWatch?.name}</p>
      </div>
    </div>
  );
}

'use client';

import { useMarketWatches } from '@/lib/hooks/useMarketWatches';
import { useMarketWatchWebSocket } from '@/lib/hooks/useMarketWatchWebSocket';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';

export default function MarketWatchWidget() {
  const { marketWatches, selectedWatch, selectedWatchId, setSelectedWatchId, loading, error } = useMarketWatches();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get tokens with their exchange codes from selected watch
  const tokensWithExchange = useMemo(() => {
    return selectedWatch?.instruments?.map((i) => ({
      token: i.token,
      exchange: i.exchange || 'NSE',
    })) || [];
  }, [selectedWatch]);

  // Subscribe to WebSocket for real-time data
  const { priceData, isConnected } = useMarketWatchWebSocket(tokensWithExchange);

  const toggleFavorite = (token: string | number) => {
    const tokenStr = String(token);
    const newFavorites = new Set(favorites);
    if (newFavorites.has(tokenStr)) {
      newFavorites.delete(tokenStr);
    } else {
      newFavorites.add(tokenStr);
    }
    setFavorites(newFavorites);
  };

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
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
              isConnected
                ? 'bg-green-900 bg-opacity-40 text-green-300'
                : 'bg-yellow-900 bg-opacity-40 text-yellow-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              {isConnected ? 'Live' : 'Connecting...'}
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
              const changePercent = liveData?.changePercent || 0;
              const isPositive = changePercent > 0;
              
              return (
                <div
                  key={instrument.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 hover:bg-opacity-30 transition border border-white border-opacity-5"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(instrument.token)}
                    className="p-0.5 hover:opacity-80 transition shrink-0"
                  >
                    <Star
                      size={14}
                      className={
                        favorites.has(String(instrument.token))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400'
                      }
                    />
                  </button>

                  {/* Instrument Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                      <p className="text-white text-xs font-semibold truncate">
                        {instrument.display_name}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {instrument.short_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                      <span className="truncate">{instrument.description}</span>
                      <span className="shrink-0 font-medium text-gray-400">{instrument.exchange}</span>
                    </div>
                  </div>

                  {/* Live Price Data */}
                  {hasData ? (
                    <div className="text-right shrink-0 min-w-20">
                      <p className="text-white text-xs font-semibold">
                        ₹{liveData.ltp?.toFixed(2) || '-'}
                      </p>
                      <p className={`text-xs font-medium ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                      </p>
                    </div>
                  ) : (
                    <div className="text-right shrink-0 min-w-20">
                      <p className="text-gray-500 text-xs">-</p>
                    </div>
                  )}
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

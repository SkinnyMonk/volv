'use client';

import { useMemo } from 'react';
import { formatINR } from '@/lib/currencyFormatter';

// Mock OHLC data for Indian stocks at realistic prices
const generateMockChartData = () => {
  const data = [];
  let price = 3700;
  
  for (let i = 0; i < 50; i++) {
    const change = (Math.random() - 0.5) * 30;
    price += change;
    data.push({
      time: i.toString().padStart(2, '0'),
      open: price - Math.random() * 10,
      high: price + Math.random() * 15,
      low: price - Math.random() * 15,
      close: price,
      volume: Math.floor(Math.random() * 10000) + 5000,
    });
  }
  
  return data;
};

export default function ChartWidget() {
  const chartData = useMemo(() => generateMockChartData(), []);
  const minPrice = Math.min(...chartData.map(d => d.low));
  const maxPrice = Math.max(...chartData.map(d => d.high));
  const priceRange = maxPrice - minPrice || 1;
  const maxVolume = Math.max(...chartData.map(d => d.volume));
  
  // Chart dimensions
  const chartHeight = 100; // 100% of container height
  const volumeHeight = 20; // 20% for volume
  const chartAreaHeight = chartHeight - volumeHeight;

  const getNormalizedY = (value: number) => {
    return chartAreaHeight - ((value - minPrice) / priceRange) * chartAreaHeight;
  };

  const getNormalizedVolume = (volume: number) => {
    return (volume / maxVolume) * volumeHeight;
  };

  const candleWidth = (100 / chartData.length) * 0.7;
  const candleSpacing = 100 / chartData.length;

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Chart Header */}
      <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-1 sm:pb-2 border-b border-white border-opacity-10 bg-slate-900 shrink-0">
        <div className="flex justify-between items-center gap-2">
          <div className="min-w-0">
            <p className="text-white text-xs sm:text-sm font-semibold truncate">TCS</p>
            <p className="text-gray-300 text-xs hidden sm:block">Tata Consultancy Services</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white text-sm sm:text-lg font-bold">{formatINR(chartData[chartData.length - 1]?.close)}</p>
            <p className="text-green-400 text-xs">+2.45%</p>
          </div>
        </div>
      </div>

      {/* Chart Container - Takes full remaining height with responsive sizing */}
      <div className="flex-1 p-2 sm:p-4 w-full relative min-h-0 overflow-hidden">
        <svg width="100%" height="100%" viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" className="absolute inset-0 p-2 sm:p-4">
          {/* Grid Lines for Price */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const price = minPrice + priceRange * ratio;
            return (
              <g key={`grid-${idx}`}>
                <line
                  x1="0"
                  y1={getNormalizedY(price)}
                  x2="100"
                  y2={getNormalizedY(price)}
                  stroke="#4B5563"
                  strokeWidth="0.3"
                  opacity="0.3"
                />
                {/* Price Labels - Only show on larger screens */}
                <text
                  x="99"
                  y={getNormalizedY(price) + 1.5}
                  fontSize="1.5"
                  fill="#9CA3AF"
                  textAnchor="end"
                  className="hidden sm:block"
                >
                  {formatINR(price, 0)}
                </text>
              </g>
            );
          })}

          {/* Candles */}
          {chartData.map((candle, idx) => {
            const x = (idx * candleSpacing) + candleSpacing / 2;
            const openY = getNormalizedY(candle.open);
            const closeY = getNormalizedY(candle.close);
            const highY = getNormalizedY(candle.high);
            const lowY = getNormalizedY(candle.low);
            const isGreen = candle.close >= candle.open;

            return (
              <g key={`candle-${idx}`}>
                {/* Wick (high-low line) */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isGreen ? '#10B981' : '#EF4444'}
                  strokeWidth="0.4"
                />

                {/* Body (open-close rectangle) */}
                <rect
                  x={x - candleWidth / 2}
                  y={Math.min(openY, closeY)}
                  width={candleWidth}
                  height={Math.abs(closeY - openY) || 0.8}
                  fill={isGreen ? '#10B981' : '#EF4444'}
                  opacity="0.9"
                />
              </g>
            );
          })}

          {/* Volume Bars */}
          {chartData.map((candle, idx) => {
            const x = (idx * candleSpacing) + candleSpacing / 2;
            const volumeBarHeight = getNormalizedVolume(candle.volume);
            const isGreen = candle.close >= candle.open;

            return (
              <rect
                key={`volume-${idx}`}
                x={x - candleWidth / 2}
                y={chartAreaHeight + (volumeHeight - volumeBarHeight)}
                width={candleWidth}
                height={volumeBarHeight}
                fill={isGreen ? '#10B98180' : '#EF444480'}
                opacity="0.5"
              />
            );
          })}

          {/* Volume Divider */}
          <line
            x1="0"
            y1={chartAreaHeight}
            x2="100"
            y2={chartAreaHeight}
            stroke="#4B5563"
            strokeWidth="0.5"
            opacity="0.5"
          />

          {/* X-axis line */}
          <line
            x1="0"
            y1={chartHeight - 0.5}
            x2="100"
            y2={chartHeight - 0.5}
            stroke="#4B5563"
            strokeWidth="0.5"
          />
        </svg>

        {/* Time Labels at Bottom - Responsive */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 sm:px-4 text-xs text-gray-400 h-4 sm:h-6">
          {chartData.map((candle, idx) => {
            if (idx % Math.ceil(chartData.length / 5) === 0) {
              return (
                <div key={idx} className="text-center text-xs">
                  {candle.time}:00
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Stats Footer - Responsive Grid */}
      <div className="px-2 sm:px-4 py-1 sm:py-2 border-t border-white border-opacity-10 bg-slate-900 grid grid-cols-5 gap-1 sm:gap-2 text-xs shrink-0">
        <div className="truncate">
          <p className="text-gray-400 text-xs">O</p>
          <p className="text-white font-semibold text-xs truncate">{chartData[0]?.open.toFixed(2)}</p>
        </div>
        <div className="truncate">
          <p className="text-gray-400 text-xs">H</p>
          <p className="text-white font-semibold text-xs truncate">{maxPrice.toFixed(2)}</p>
        </div>
        <div className="truncate">
          <p className="text-gray-400 text-xs">L</p>
          <p className="text-white font-semibold text-xs truncate">{minPrice.toFixed(2)}</p>
        </div>
        <div className="truncate">
          <p className="text-gray-400 text-xs">C</p>
          <p className="text-white font-semibold text-xs truncate">{chartData[chartData.length - 1]?.close.toFixed(2)}</p>
        </div>
        <div className="truncate">
          <p className="text-gray-400 text-xs">V</p>
          <p className="text-white font-semibold text-xs truncate">{(maxVolume / 1000000).toFixed(1)}M</p>
        </div>
      </div>
    </div>
  );
}

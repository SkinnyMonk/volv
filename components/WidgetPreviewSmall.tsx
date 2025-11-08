'use client';

interface WidgetPreviewSmallProps {
  widgetId: number;
}

export default function WidgetPreviewSmall({ widgetId }: WidgetPreviewSmallProps) {
  const renderPreview = (id: number) => {
    switch (id) {
      case 1: // Chart Widget
        return (
          <div className="w-full h-full flex flex-col bg-slate-800">
            <div className="px-2 py-1 border-b border-white border-opacity-10 bg-slate-900">
              <p className="text-white text-[8px] font-semibold">AAPL</p>
            </div>
            <div className="flex-1 flex items-end justify-around px-1 py-1">
              {[30, 50, 40, 60, 45, 55, 50].map((height, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="w-0.5 bg-green-400" style={{ height: `${height * 0.4}px` }} />
                  <div className="w-0.5 h-0.5 bg-gray-400" />
                </div>
              ))}
            </div>
            <div className="px-1 py-0.5 border-t border-white border-opacity-10 text-[7px] text-gray-400">
              <p>O: 100 H: 105</p>
            </div>
          </div>
        );

      case 2: // Option Chain Widget
        return (
          <div className="w-full h-full flex flex-col bg-slate-800">
            <div className="px-2 py-1 border-b border-white border-opacity-10 bg-slate-900">
              <p className="text-white text-[8px] font-semibold">Options Chain</p>
            </div>
            <div className="flex-1 overflow-hidden px-1 py-1">
              <div className="space-y-0.5 text-[7px]">
                <div className="flex gap-1">
                  <span className="text-green-400 w-4">10.25</span>
                  <span className="text-red-400 w-4">10.35</span>
                  <span className="text-gray-400 w-3">150</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-green-400 w-4">10.15</span>
                  <span className="text-red-400 w-4">10.25</span>
                  <span className="text-gray-400 w-3">145</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-green-400 w-4">10.05</span>
                  <span className="text-red-400 w-4">10.15</span>
                  <span className="text-gray-400 w-3">142</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Positions Widget
        return (
          <div className="w-full h-full flex flex-col bg-slate-800">
            <div className="px-2 py-1 border-b border-white border-opacity-10 bg-slate-900">
              <p className="text-white text-[8px] font-semibold">Positions</p>
            </div>
            <div className="flex-1 overflow-hidden px-1 py-1 space-y-1">
              <div className="flex justify-between text-[7px]">
                <span className="text-white font-bold">AAPL</span>
                <span className="text-green-400 font-bold">+$245</span>
              </div>
              <div className="flex justify-between text-[7px]">
                <span className="text-gray-300">50 shares</span>
                <span className="text-green-400">+1.23%</span>
              </div>
              <div className="border-t border-gray-600" />
              <div className="flex justify-between text-[7px]">
                <span className="text-white font-bold">MSFT</span>
                <span className="text-red-400 font-bold">-$125</span>
              </div>
              <div className="flex justify-between text-[7px]">
                <span className="text-gray-300">25 shares</span>
                <span className="text-red-400">-0.85%</span>
              </div>
            </div>
          </div>
        );

      case 4: // Orders Widget
        return (
          <div className="w-full h-full flex flex-col bg-slate-800">
            <div className="px-2 py-1 border-b border-white border-opacity-10 bg-slate-900">
              <p className="text-white text-[8px] font-semibold">Orders</p>
            </div>
            <div className="flex-1 overflow-hidden px-1 py-1 space-y-0.5">
              <div className="flex gap-1 text-[7px] items-center">
                <span className="bg-green-900 text-green-400 px-1 rounded text-[6px]">BUY</span>
                <span className="text-white font-bold flex-1">AAPL</span>
                <span className="text-gray-400">50@150</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex gap-1 text-[7px] items-center">
                <span className="bg-red-900 text-red-400 px-1 rounded text-[6px]">SELL</span>
                <span className="text-white font-bold flex-1">MSFT</span>
                <span className="text-gray-400">25@420</span>
                <span className="text-yellow-400">⏱</span>
              </div>
              <div className="flex gap-1 text-[7px] items-center">
                <span className="bg-green-900 text-green-400 px-1 rounded text-[6px]">BUY</span>
                <span className="text-white font-bold flex-1">GOOGL</span>
                <span className="text-gray-400">30@165</span>
                <span className="text-green-400">✓</span>
              </div>
            </div>
          </div>
        );

      case 5: // Market Depth Widget
        return (
          <div className="w-full h-full flex flex-col bg-slate-800">
            <div className="px-2 py-1 border-b border-white border-opacity-10 bg-slate-900">
              <p className="text-white text-[8px] font-semibold">Market Depth</p>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Bids */}
              <div className="flex-1 px-1 py-1 space-y-1">
                <div className="flex gap-1 text-[7px]">
                  <div className="flex-1 bg-green-900 bg-opacity-30 text-green-400 px-1 text-center rounded">
                    150.25
                  </div>
                  <div className="w-6 bg-green-500 rounded opacity-40" style={{ height: '60%' }} />
                </div>
                <div className="flex gap-1 text-[7px]">
                  <div className="flex-1 bg-green-900 bg-opacity-30 text-green-400 px-1 text-center rounded">
                    150.15
                  </div>
                  <div className="w-4 bg-green-500 rounded opacity-40" style={{ height: '40%' }} />
                </div>
              </div>
              <div className="border-l border-gray-600" />
              {/* Asks */}
              <div className="flex-1 px-1 py-1 space-y-1">
                <div className="flex gap-1 text-[7px]">
                  <div className="w-4 bg-red-500 rounded opacity-40" style={{ height: '50%' }} />
                  <div className="flex-1 bg-red-900 bg-opacity-30 text-red-400 px-1 text-center rounded">
                    150.35
                  </div>
                </div>
                <div className="flex gap-1 text-[7px]">
                  <div className="w-6 bg-red-500 rounded opacity-40" style={{ height: '70%' }} />
                  <div className="flex-1 bg-red-900 bg-opacity-30 text-red-400 px-1 text-center rounded">
                    150.45
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Market Watch Widget
        return (
          <div className="w-full h-full flex flex-col bg-slate-800">
            <div className="px-2 py-1 border-b border-white border-opacity-10 bg-slate-900">
              <p className="text-white text-[8px] font-semibold">Market Watch</p>
            </div>
            <div className="flex-1 overflow-hidden px-1 py-1 space-y-1">
              <div className="flex justify-between text-[7px]">
                <span className="text-white font-bold">AAPL</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-white">$150.25</span>
                  <span className="text-green-400 text-[6px]">↑+2.45%</span>
                </div>
              </div>
              <div className="flex justify-between text-[7px]">
                <span className="text-white font-bold">MSFT</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-white">$420.50</span>
                  <span className="text-red-400 text-[6px]">↓-1.23%</span>
                </div>
              </div>
              <div className="flex justify-between text-[7px]">
                <span className="text-white font-bold">GOOGL</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-white">$165.00</span>
                  <span className="text-green-400 text-[6px]">↑+0.95%</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-600 bg-slate-800">
      {renderPreview(widgetId)}
    </div>
  );
}

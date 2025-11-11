'use client';

import OptionChainWidget from '@/components/widgets/OptionChainWidget';

export default function OptionChainPage() {
  return (
    <div className="w-full h-full p-6 bg-gray-900">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Option Chain Widget</h1>
          <p className="text-gray-400 text-sm">View options data across all strikes and expiries</p>
        </div>
        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-hidden">
          <OptionChainWidget />
        </div>
      </div>
    </div>
  );
}

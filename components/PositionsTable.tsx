'use client';

import { usePositions } from '@/lib/hooks/usePositions';
import { useState } from 'react';

export function PositionsTable() {
  const { positions, loading, error, refetch } = usePositions();
  const [tab, setTab] = useState<'open' | 'closed'>('open');

  // Filter positions based on tab
  const filteredPositions = positions.filter((position) => {
    if (tab === 'open') {
      return position.net_quantity > 0;
    } else {
      return position.net_quantity === 0;
    }
  });

  if (error) {
    return (
      <div className="bg-red-950 border border-red-800 rounded-lg p-4">
        <p className="text-red-300">Error: {error}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-400">Loading positions...</span>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No positions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('open')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            tab === 'open'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Open ({positions.filter((p) => p.net_quantity > 0).length})
        </button>
        <button
          onClick={() => setTab('closed')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            tab === 'closed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Closed ({positions.filter((p) => p.net_quantity === 0).length})
        </button>
      </div>

      {/* Empty State */}
      {filteredPositions.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            No {tab} positions
          </p>
        </div>
      )}

      {/* Table */}
      {filteredPositions.length > 0 && (
        <div className="overflow-x-auto border border-gray-800 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-300">SCRIP NAME</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-300">QTY</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-300">AVG. BUY PRICE</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-300">LTP</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-300">CURRENT VALUE</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-300">P&L</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-300">P&L %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPositions.map((position, index) => (
                <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3 text-gray-300 font-medium">
                    <div className="flex flex-col">
                      <span>{position.symbol}</span>
                      <span className="text-xs text-gray-500">{position.trading_symbol}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right text-gray-400">{position.net_quantity}</td>
                  <td className="px-6 py-3 text-right text-gray-400">
                    ₹{Number(position.average_buy_price).toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-400">
                    ₹{Number(position.ltp).toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-400">
                    ₹{Number(position.current_value).toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-3 text-right font-medium ${
                      Number(position.pnl) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    ₹{Number(position.pnl).toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-3 text-right font-medium ${
                      Number(position.pnl_percentage) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {Number(position.pnl_percentage).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Cards */}
      {filteredPositions.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total {tab === 'open' ? 'Open' : 'Closed'} Positions</p>
            <p className="text-2xl font-bold text-white mt-2">{filteredPositions.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-white mt-2">
              ₹{filteredPositions.reduce((sum, pos) => sum + Number(pos.current_value), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total P&L</p>
            <p
              className={`text-2xl font-bold mt-2 ${
                filteredPositions.reduce((sum, pos) => sum + Number(pos.pnl), 0) >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              ₹{filteredPositions.reduce((sum, pos) => sum + Number(pos.pnl), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Avg P&L %</p>
            <p
              className={`text-2xl font-bold mt-2 ${
                filteredPositions.reduce((sum, pos) => sum + Number(pos.pnl_percentage), 0) /
                  filteredPositions.length >=
                0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {(
                filteredPositions.reduce((sum, pos) => sum + Number(pos.pnl_percentage), 0) /
                filteredPositions.length
              ).toFixed(2)}
              %
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

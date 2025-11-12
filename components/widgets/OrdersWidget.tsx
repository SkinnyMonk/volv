'use client';

import { useState } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { formatINR } from '@/lib/currencyFormatter';
import { useOrders } from '@/lib/hooks/useOrders';
import { useTrades } from '@/lib/hooks/useTrades';

// Get mock client ID from localStorage or use default
const getClientId = (): string => {
  if (typeof window === 'undefined') return 'MS3122';
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const { client_id } = JSON.parse(user);
      return client_id || 'MS3122';
    } catch {
      return 'MS3122';
    }
  }
  return 'MS3122';
};

const getStatusIcon = (status: string) => {
  if (
    status === 'COMPLETE' ||
    status === 'FILLED' ||
    status === 'EXECUTED'
  ) {
    return <CheckCircle size={12} className="text-green-400" />;
  }
  if (status === 'PENDING' || status === 'OPEN') {
    return <Clock size={12} className="text-yellow-400" />;
  }
  if (
    status === 'REJECTED' ||
    status === 'CANCEL_CONFIRMED' ||
    status === 'AMO_CANCEL_CONFIRMED'
  ) {
    return <XCircle size={12} className="text-red-400" />;
  }
  return <AlertCircle size={12} className="text-gray-400" />;
};

const getStatusColor = (status: string) => {
  if (
    status === 'COMPLETE' ||
    status === 'FILLED' ||
    status === 'EXECUTED'
  ) {
    return 'bg-green-900 bg-opacity-20 text-green-400';
  }
  if (status === 'PENDING' || status === 'OPEN') {
    return 'bg-yellow-900 bg-opacity-20 text-yellow-400';
  }
  if (
    status === 'REJECTED' ||
    status === 'CANCEL_CONFIRMED' ||
    status === 'AMO_CANCEL_CONFIRMED'
  ) {
    return 'bg-red-900 bg-opacity-20 text-red-400';
  }
  return 'bg-gray-900 bg-opacity-20 text-gray-400';
};

export default function OrdersWidget() {
  const clientId = getClientId();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'trades'>(
    'completed'
  );

  const { orders: completedOrders } = useOrders({
    clientId,
    orderType: 'completed',
    autoRefresh: true,
    refreshInterval: 5000,
  });

  const { orders: pendingOrders } = useOrders({
    clientId,
    orderType: 'pending',
    autoRefresh: true,
    refreshInterval: 5000,
  });

  const { trades } = useTrades({
    clientId,
    autoRefresh: true,
    refreshInterval: 5000,
  });

  // Get data based on active tab
  const getDisplayData = () => {
    switch (activeTab) {
      case 'pending':
        return { data: pendingOrders, isPending: true };
      case 'completed':
        return { data: completedOrders, isPending: false };
      case 'trades':
        return { data: trades, isTrade: true };
      default:
        return { data: [], isPending: false };
    }
  };

  const displayData = getDisplayData();
  const isTrade = 'isTrade' in displayData && displayData.isTrade;

  const tabs = [
    { id: 'pending', label: 'Pending', count: pendingOrders.length },
    { id: 'completed', label: 'Completed', count: completedOrders.length },
    { id: 'trades', label: 'Trades', count: trades.length },
  ];

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Header with Tabs */}
      <div className="border-b border-white border-opacity-10 bg-slate-900 shrink-0">
        {/* Title */}
        <div className="px-3 py-2 border-b border-white border-opacity-10">
          <p className="text-white text-xs font-semibold truncate">Orders & Trades</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'pending' | 'completed' | 'trades')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  activeTab === tab.id
                    ? 'bg-blue-900 bg-opacity-30 text-blue-400'
                    : 'bg-gray-900 bg-opacity-30 text-gray-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-w-0">
        {displayData.data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-xs">No {activeTab} {isTrade ? 'trades' : 'orders'}</p>
          </div>
        ) : (
          <div className="min-w-full text-xs">
            {/* Header Row */}
            <div className="sticky top-0 flex bg-slate-700 border-b border-white border-opacity-10 shrink-0">
              {isTrade ? (
                <>
                  <div className="flex-1 min-w-20 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">Scrip Name</div>
                  <div className="flex-1 min-w-12 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5 text-right">Qty</div>
                  <div className="flex-1 min-w-16 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5 text-right">Price</div>
                  <div className="flex-1 min-w-16 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5 text-right">Order</div>
                  <div className="flex-1 min-w-10 px-2 py-2 text-gray-400 font-semibold text-xs">Time</div>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-20 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">Scrip Name</div>
                  <div className="flex-1 min-w-12 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5 text-right">Qty</div>
                  <div className="flex-1 min-w-16 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5 text-right">Price</div>
                  <div className="flex-1 min-w-20 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5 text-center">Status</div>
                  <div className="flex-1 min-w-10 px-2 py-2 text-gray-400 font-semibold text-xs">Time</div>
                </>
              )}
            </div>

            {/* Data Rows */}
            {isTrade ? (
              // Trades Table
              (displayData.data as typeof trades).map((trade) => (
                <div
                  key={trade.id}
                  className="flex border-b border-white border-opacity-5 hover:bg-slate-700 hover:bg-opacity-30 transition"
                >
                  <div className="flex-1 min-w-20 px-2 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-semibold text-xs truncate flex-1">
                        {trade.symbol}
                      </div>
                      <div
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                          trade.type === 'BUY'
                            ? 'bg-green-900 bg-opacity-30 text-green-400'
                            : 'bg-red-900 bg-opacity-30 text-red-400'
                        }`}
                      >
                        {trade.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-12 px-2 py-2 text-gray-300 text-xs text-right">
                    {trade.quantity}
                  </div>
                  <div className="flex-1 min-w-16 px-2 py-2 text-gray-300 text-xs text-right truncate">
                    {formatINR(trade.price)}
                  </div>
                  <div className="flex-1 min-w-16 px-2 py-2 text-gray-400 text-xs text-right truncate">
                    {formatINR(trade.orderPrice)}
                  </div>
                  <div className="flex-1 min-w-10 px-2 py-2 text-gray-400 text-xs">{trade.time}</div>
                </div>
              ))
            ) : (
              // Orders Table
              (displayData.data as typeof completedOrders).map((order) => (
                <div
                  key={order.id}
                  className="flex border-b border-white border-opacity-5 hover:bg-slate-700 hover:bg-opacity-30 transition"
                >
                  <div className="flex-1 min-w-20 px-2 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-semibold text-xs truncate flex-1">
                        {order.symbol}
                      </div>
                      <div
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                          order.type === 'BUY'
                            ? 'bg-green-900 bg-opacity-30 text-green-400'
                            : 'bg-red-900 bg-opacity-30 text-red-400'
                        }`}
                      >
                        {order.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-12 px-2 py-2 text-gray-300 text-xs text-right">
                    {order.quantity}
                  </div>
                  <div className="flex-1 min-w-16 px-2 py-2 text-gray-300 text-xs text-right truncate">
                    {formatINR(order.price)}
                  </div>
                  <div className="flex-1 min-w-20 px-2 py-2 text-xs flex items-center justify-center">
                    <div
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded w-fit ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="text-xs font-medium truncate">{order.status}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-10 px-2 py-2 text-gray-400 text-xs">{order.time}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

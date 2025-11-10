'use client';

import { useMemo } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatINR } from '@/lib/currencyFormatter';

interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  qty: number;
  price: number;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
  time: string;
}

const generateMockOrders = (): Order[] => {
  return [
    { id: 'ORD001', symbol: 'TCS', type: 'BUY', qty: 50, price: 3745.25, status: 'FILLED', time: '09:30' },
    { id: 'ORD002', symbol: 'INFY', type: 'SELL', qty: 25, price: 2890.50, status: 'PENDING', time: '10:15' },
    { id: 'ORD003', symbol: 'RELIANCE', type: 'BUY', qty: 30, price: 2925.00, status: 'FILLED', time: '10:45' },
    { id: 'ORD004', symbol: 'HDFC', type: 'BUY', qty: 15, price: 2415.00, status: 'CANCELLED', time: '11:20' },
    { id: 'ORD005', symbol: 'SBIN', type: 'SELL', qty: 40, price: 680.00, status: 'PENDING', time: '11:55' },
  ];
};

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'FILLED':
      return <CheckCircle size={12} className="text-green-400" />;
    case 'PENDING':
      return <Clock size={12} className="text-yellow-400" />;
    case 'CANCELLED':
      return <XCircle size={12} className="text-red-400" />;
  }
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'FILLED':
      return 'bg-green-900 bg-opacity-20 text-green-400';
    case 'PENDING':
      return 'bg-yellow-900 bg-opacity-20 text-yellow-400';
    case 'CANCELLED':
      return 'bg-red-900 bg-opacity-20 text-red-400';
  }
};

export default function OrdersWidget() {
  const orders = useMemo(() => generateMockOrders(), []);

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white border-opacity-10 bg-slate-900 shrink-0">
        <p className="text-white text-xs font-semibold truncate">Recent Orders</p>
      </div>

      {/* Orders List with horizontal scroll - Fully responsive */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-w-0">
        <div className="min-w-full text-xs">
          {/* Header Row */}
          <div className="sticky top-0 flex bg-slate-700 border-b border-white border-opacity-10 shrink-0">
            <div className="flex-1 min-w-12 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">ID</div>
            <div className="flex-1 min-w-16 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">Type</div>
            <div className="flex-1 min-w-12 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">Sym</div>
            <div className="flex-1 min-w-12 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5 text-right">Qty</div>
            <div className="flex-1 min-w-16 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5 text-right">Price</div>
            <div className="flex-1 min-w-20 px-2 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5 text-center">Status</div>
            <div className="flex-1 min-w-10 px-2 py-2 text-gray-400 font-semibold text-xs">Time</div>
          </div>

          {/* Data Rows */}
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex border-b border-white border-opacity-5 hover:bg-slate-700 hover:bg-opacity-30 transition"
            >
              <div className="flex-1 min-w-12 px-2 py-2 text-gray-300 text-xs truncate">{order.id}</div>
              <div className="flex-1 min-w-16 px-2 py-2 text-xs">
                <div className={`px-1.5 py-0.5 rounded text-xs font-semibold w-fit truncate ${
                  order.type === 'BUY' ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-red-900 bg-opacity-30 text-red-400'
                }`}>
                  {order.type}
                </div>
              </div>
              <div className="flex-1 min-w-12 px-2 py-2 text-white font-semibold text-xs truncate">{order.symbol}</div>
              <div className="flex-1 min-w-12 px-2 py-2 text-gray-300 text-xs text-right">{order.qty}</div>
              <div className="flex-1 min-w-16 px-2 py-2 text-gray-300 text-xs text-right truncate">{formatINR(order.price)}</div>
              <div className="flex-1 min-w-20 px-2 py-2 text-xs flex items-center justify-center">
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded w-fit ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="text-xs font-medium truncate">{order.status}</span>
                </div>
              </div>
              <div className="flex-1 min-w-10 px-2 py-2 text-gray-400 text-xs">{order.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

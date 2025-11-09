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
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white border-opacity-10 bg-slate-900">
        <p className="text-white text-xs font-semibold">Recent Orders</p>
      </div>

      {/* Orders List with horizontal scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-max text-xs">
          {/* Header Row */}
          <div className="sticky top-0 flex bg-slate-700 border-b border-white border-opacity-10">
            <div className="w-16 shrink-0 px-3 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">ID</div>
            <div className="w-20 shrink-0 px-3 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">Type</div>
            <div className="w-16 shrink-0 px-3 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">Sym</div>
            <div className="w-12 shrink-0 px-3 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">Qty</div>
            <div className="w-16 shrink-0 px-3 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">Price</div>
            <div className="w-24 shrink-0 px-3 py-2 text-gray-400 font-semibold text-xs border-r border-white border-opacity-5">Status</div>
            <div className="w-12 shrink-0 px-3 py-2 text-gray-400 font-semibold text-xs">Time</div>
          </div>

          {/* Data Rows */}
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex border-b border-white border-opacity-5 hover:bg-slate-700 hover:bg-opacity-30 transition"
            >
              <div className="w-16 shrink-0 px-3 py-2 text-gray-300 text-xs">{order.id}</div>
              <div className="w-20 shrink-0 px-3 py-2 text-xs">
                <div className={`px-1.5 py-0.5 rounded text-xs font-semibold w-fit ${
                  order.type === 'BUY' ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-red-900 bg-opacity-30 text-red-400'
                }`}>
                  {order.type}
                </div>
              </div>
              <div className="w-16 shrink-0 px-3 py-2 text-white font-semibold text-xs">{order.symbol}</div>
              <div className="w-12 shrink-0 px-3 py-2 text-gray-300 text-xs">{order.qty}</div>
              <div className="w-16 shrink-0 px-3 py-2 text-gray-300 text-xs">{formatINR(order.price)}</div>
              <div className="w-24 shrink-0 px-3 py-2 text-xs">
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded w-fit ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="text-xs font-medium">{order.status}</span>
                </div>
              </div>
              <div className="w-12 shrink-0 px-3 py-2 text-gray-400 text-xs">{order.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

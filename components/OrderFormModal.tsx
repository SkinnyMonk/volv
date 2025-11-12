'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, X } from 'lucide-react';
import { useMarketWatchWebSocket } from '@/lib/hooks/useMarketWatchWebSocket';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// SBIN: token 3045, NSE exchange
const SBIN_TOKEN = 3045;
const SBIN_EXCHANGE = 'NSE';

export default function OrderFormModal({ isOpen, onClose }: OrderFormModalProps) {
  const [position, setPosition] = useState({ x: 20, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Fetch live price data for SBIN
  const { priceData } = useMarketWatchWebSocket([
    { token: SBIN_TOKEN, exchange: SBIN_EXCHANGE }
  ]);
  
  const sbinPrice = priceData.get(SBIN_TOKEN);
  
  const [formData, setFormData] = useState({
    symbol: 'SBIN',
    orderType: 'BUY',
    quantity: '1',
    price: sbinPrice?.ltp?.toString() || '',
    orderExecutionType: 'LIMIT',
    intraday: false,
  });

  // Update price when live data comes in - only on first load
  useEffect(() => {
    if (sbinPrice?.ltp && formData.price === '') {
      setFormData(prev => ({
        ...prev,
        price: sbinPrice.ltp?.toString() || ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  const currentPrice = sbinPrice?.ltp || parseFloat(formData.price) || 0;

  return (
    <div
      ref={modalRef}
      className="fixed bg-slate-900 border border-gray-700 rounded-lg shadow-2xl w-80 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header - Draggable */}
      <div
        className="resize-handle flex items-center justify-between bg-slate-950 border-b border-gray-700 px-4 py-3 rounded-t-lg cursor-move hover:bg-slate-900 transition"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-gray-500" />
          <h2 className="text-white font-semibold text-sm">Place Order</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-red-600/20 rounded-full transition"
        >
          <X size={16} className="text-gray-500 hover:text-red-500" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-4">
        {/* Stock Header with Exchange Selector */}
        <div className="bg-slate-800 rounded p-3 space-y-2">
          <h3 className="text-white font-semibold text-sm">{formData?.symbol}</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-white font-semibold text-sm">NSE ₹{sbinPrice?.ltp?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Type Tabs */}
        <div className="flex gap-2 text-xs border-b border-gray-700">
          <button className="pb-2 text-blue-500 border-b-2 border-blue-500 font-semibold">Quick</button>
          <button className="pb-2 text-gray-500 hover:text-gray-400">Regular</button>
          <button className="pb-2 text-gray-500 hover:text-gray-400">MTF</button>
          <button className="pb-2 text-gray-500 hover:text-gray-400">Iceberg</button>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-gray-400 text-xs font-semibold block mb-2">Qty.</label>
          <div className="flex items-center bg-slate-800 border border-gray-700 rounded">
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="flex-1 bg-slate-800 text-white px-3 py-3 text-sm focus:outline-none"
              placeholder="1"
            />
            <button className="px-3 py-3 text-gray-500 hover:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0-18v18m0-18l10-4v14l-10 4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="text-gray-400 text-xs font-semibold block mb-2">Price</label>
          <div className="flex items-center bg-slate-800 border border-gray-700 rounded">
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="flex-1 bg-slate-800 text-white px-3 py-3 text-sm focus:outline-none"
              placeholder="0.00"
              step="0.05"
            />
            <button className="px-3 py-3 text-gray-500 hover:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Intraday Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="intraday"
            checked={formData.intraday}
            onChange={(e) => setFormData({ ...formData, intraday: e.target.checked })}
            className="w-4 h-4 rounded border border-gray-600 bg-slate-800 accent-blue-500"
          />
          <label htmlFor="intraday" className="text-gray-400 text-xs">Intraday</label>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-800 border border-gray-700 rounded p-3 space-y-1 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Req.</span>
            <span className="text-white font-semibold">₹{currentPrice.toFixed(2)}</span>
            <span className="text-green-500">+1.55</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Avail.</span>
            <span className="text-red-500">₹-88.50</span>
          </div>
        </div>

        {/* Buy Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold text-sm transition">
          Buy
        </button>

        {/* Cancel Button */}
        <button 
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded font-semibold text-sm transition border border-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

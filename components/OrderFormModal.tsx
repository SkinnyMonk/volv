'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, X } from 'lucide-react';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderFormModal({ isOpen, onClose }: OrderFormModalProps) {
  const [position, setPosition] = useState({ x: 20, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    symbol: 'AAPL',
    orderType: 'BUY',
    quantity: '1',
    price: '150.25',
    orderExecutionType: 'LIMIT',
  });

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

  return (
    <div
      ref={modalRef}
      className="fixed bg-slate-800 border border-gray-600 rounded-lg shadow-2xl w-72 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header - Draggable */}
      <div
        className="resize-handle flex items-center justify-between bg-slate-900 border-b border-gray-600 px-4 py-3 rounded-t-lg cursor-move hover:bg-slate-800 transition"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-gray-400" />
          <h2 className="text-white font-semibold text-sm">Place Order</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-red-600 rounded-full transition"
        >
          <X size={16} className="text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-3">
        {/* Symbol Input */}
        <div>
          <label className="text-gray-400 text-xs font-semibold block mb-1">Symbol</label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            className="w-full bg-slate-700 border border-gray-600 text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-blue-500"
            placeholder="e.g., AAPL"
          />
        </div>

        {/* Order Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFormData({ ...formData, orderType: 'BUY' })}
            className={`py-2 px-3 rounded text-xs font-semibold transition ${
              formData.orderType === 'BUY'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => setFormData({ ...formData, orderType: 'SELL' })}
            className={`py-2 px-3 rounded text-xs font-semibold transition ${
              formData.orderType === 'SELL'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-gray-400 text-xs font-semibold block mb-1">Quantity</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full bg-slate-700 border border-gray-600 text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-blue-500"
            placeholder="0"
          />
        </div>

        {/* Order Execution Type */}
        <div>
          <label className="text-gray-400 text-xs font-semibold block mb-1">Order Type</label>
          <select
            value={formData.orderExecutionType}
            onChange={(e) => setFormData({ ...formData, orderExecutionType: e.target.value })}
            className="w-full bg-slate-700 border border-gray-600 text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-blue-500"
          >
            <option>LIMIT</option>
            <option>MARKET</option>
            <option>STOP</option>
            <option>STOP LIMIT</option>
          </select>
        </div>

        {/* Price */}
        {formData.orderExecutionType !== 'MARKET' && (
          <div>
            <label className="text-gray-400 text-xs font-semibold block mb-1">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-slate-700 border border-gray-600 text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-slate-700 border border-gray-600 rounded p-3 space-y-1 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Total Value:</span>
            <span className="text-white font-semibold">
              ${(parseFloat(formData.quantity || '0') * parseFloat(formData.price || '0')).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button className={`py-2 px-3 rounded text-xs font-semibold transition text-white ${
            formData.orderType === 'BUY'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}>
            {formData.orderType === 'BUY' ? 'BUY' : 'SELL'} NOW
          </button>
          <button 
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded text-xs font-semibold transition"
          >
            Cancel
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-gray-500 text-xs text-center italic">
          Order will be placed in live market
        </p>
      </div>
    </div>
  );
}

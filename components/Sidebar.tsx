'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, TrendingUp, Zap, Layout } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: TrendingUp, label: 'Stocks', href: '#', disabled: true },
    { icon: Zap, label: 'Option Trader', href: '#', disabled: true },
    { icon: Layout, label: 'Custom Layout', href: '/layout', disabled: false },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gray-950 border-r border-gray-800 transition-all duration-300 ease-out z-40 flex flex-col items-center pt-4 ${
          isOpen ? 'w-48' : 'w-20'
        }`}
      >
        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors mb-4"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={24} strokeWidth={2} />
          ) : (
            <Menu size={24} strokeWidth={2} />
          )}
        </button>
        {/* Menu Items */}
        <nav className="flex flex-col gap-4 w-full px-1 mt-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="relative group flex justify-center">
                {item.disabled ? (
                  <div
                    className={`flex items-center gap-3 rounded-md text-gray-500 cursor-not-allowed opacity-50 transition-all duration-200 ${
                      isOpen ? 'px-3 py-2' : 'p-2'
                    }`}
                    title="Coming soon"
                  >
                    <Icon size={20} className="shrink-0" />
                    <span
                      className={`whitespace-nowrap text-xs font-medium overflow-hidden transition-opacity duration-200 ${
                        isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 ${
                      isOpen ? 'px-3 py-2' : 'p-2'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={20} className="shrink-0" />
                    <span
                      className={`whitespace-nowrap text-xs font-medium overflow-hidden transition-opacity duration-200 ${
                        isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )}

                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-20 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-gray-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

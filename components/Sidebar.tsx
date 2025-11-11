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
      <aside
        className={`bg-gray-950 border-r border-gray-800 transition-all duration-300 ease-out flex flex-col items-center pt-4 h-full shrink-0 ${
          isOpen ? 'w-48' : 'w-20'
        }`}
        style={{ width: isOpen ? '192px' : '80px' }}
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
              <div key={index} className="relative group flex justify-center w-full">
                {item.disabled ? (
                  <div
                    className={`flex items-center rounded-md text-gray-500 cursor-not-allowed opacity-50 transition-all duration-200 ${
                      isOpen ? 'px-3 py-2 gap-3 w-full' : 'p-2 justify-center'
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
                    className={`flex items-center rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 ${
                      isOpen ? 'px-3 py-2 gap-3 w-full' : 'p-2 justify-center'
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

                {/* Tooltip for collapsed state - positioned below */}
                {!isOpen && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-gray-100 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ maxWidth: '80px', width: '80px' }}>
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

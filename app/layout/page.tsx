'use client';

import { useState } from 'react';

export default function LayoutPage() {
  const [openWidget, setOpenWidget] = useState(false);

  const widgets = [
    { id: 1, name: 'Chart', color: 'bg-blue-500' },
    { id: 2, name: 'Option Chain', color: 'bg-purple-500' },
    { id: 3, name: 'Positions', color: 'bg-green-500' },
    { id: 4, name: 'Orders', color: 'bg-orange-500' },
    { id: 5, name: 'Market Depth', color: 'bg-red-500' },
    { id: 6, name: 'Market Watch', color: 'bg-pink-500' },
  ];

  return (
    <main className="w-screen h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header Row */}
      <div className="p-8 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-4xl font-bold text-white">Custom Layout</h1>
        <div className="relative">
          <button
            onClick={() => setOpenWidget(!openWidget)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
          >
            Add Widget
          </button>

          {/* Dropdown Modal */}
          {openWidget && (
            <div className="absolute top-14 right-0 bg-slate-800 border border-gray-600 rounded-lg shadow-2xl p-6 w-96 z-50">
              <div className="grid grid-cols-3 gap-6">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex flex-col items-center cursor-pointer hover:opacity-80 transition"
                    onClick={() => {
                      // Handle widget selection here
                      setOpenWidget(false);
                    }}
                  >
                    <div className={`${widget.color} w-24 h-24 rounded-lg mb-3 shadow-lg hover:shadow-xl transition`}></div>
                    <span className="text-white text-sm font-medium text-center">{widget.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 m-6 border border-gray-400 rounded-lg p-6 overflow-auto bg-slate-800 bg-opacity-50">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-lg">Select a widget from Add Widget button to get started</p>
        </div>
      </div>
    </main>
  );
}

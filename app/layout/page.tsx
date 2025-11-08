'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface Widget {
  id: number;
  name: string;
  color: string;
  defaultCols: number;
  defaultRows: number;
  minCols: number;
  maxCols: number;
  minRows: number;
  maxRows: number;
}

interface GridWidget {
  widgetId: number;
  instanceId: string;
  name: string;
  color: string;
  cols: number;
  rows: number;
  row: number;
  col: number;
}

export default function LayoutPage() {
  const [openWidget, setOpenWidget] = useState(false);
  const [gridWidgets, setGridWidgets] = useState<GridWidget[]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const GRID_ROWS = 4;

  const availableWidgets: Widget[] = [
    { id: 1, name: 'Chart', color: 'bg-blue-500', defaultCols: 6, defaultRows: 2, minCols: 4, maxCols: 12, minRows: 1, maxRows: 4 },
    { id: 2, name: 'Option Chain', color: 'bg-purple-500', defaultCols: 4, defaultRows: 2, minCols: 3, maxCols: 8, minRows: 1, maxRows: 4 },
    { id: 3, name: 'Positions', color: 'bg-green-500', defaultCols: 3, defaultRows: 2, minCols: 2, maxCols: 6, minRows: 1, maxRows: 3 },
    { id: 4, name: 'Orders', color: 'bg-orange-500', defaultCols: 3, defaultRows: 1, minCols: 2, maxCols: 6, minRows: 1, maxRows: 2 },
    { id: 5, name: 'Market Depth', color: 'bg-red-500', defaultCols: 4, defaultRows: 2, minCols: 3, maxCols: 8, minRows: 1, maxRows: 4 },
    { id: 6, name: 'Market Watch', color: 'bg-pink-500', defaultCols: 3, defaultRows: 2, minCols: 2, maxCols: 6, minRows: 1, maxRows: 4 },
  ];

  // Calculate dimensions for equal horizontal distribution
  const calculateWidgetLayout = (): { cols: number; rows: number; col: number } => {
    const totalWidgets = gridWidgets.length + 1; // +1 for the widget being added
    const colsPerWidget = 12 / totalWidgets; // Use flexible division instead of floor
    const colPosition = gridWidgets.length * colsPerWidget;

    return {
      cols: colsPerWidget,
      rows: GRID_ROWS, // Full height
      col: colPosition,
    };
  };

  // Redistribute all widgets when a new one is added
  const redistributeAllWidgets = (newWidget: GridWidget): GridWidget[] => {
    const allWidgets = [...gridWidgets, newWidget];
    const totalWidgets = allWidgets.length;
    const colsPerWidget = 12 / totalWidgets; // Use flexible division instead of floor

    return allWidgets.map((widget, index) => ({
      ...widget,
      cols: colsPerWidget,
      rows: GRID_ROWS,
      row: 0,
      col: index * colsPerWidget,
    }));
  };

  const handleAddWidget = (widget: Widget) => {
    const layout = calculateWidgetLayout();
    const uniqueId = `${widget.id}-${gridWidgets.length}-${new Date().getTime()}`;

    const newWidget: GridWidget = {
      widgetId: widget.id,
      instanceId: uniqueId,
      name: widget.name,
      color: widget.color,
      cols: layout.cols,
      rows: layout.rows,
      row: 0,
      col: layout.col,
    };

    // Add new widget and redistribute all widgets
    const updatedWidgets = redistributeAllWidgets(newWidget);
    setGridWidgets(updatedWidgets);
    setOpenWidget(false);
  };

  const handleRemoveWidget = (instanceId: string) => {
    const filtered = gridWidgets.filter((w) => w.instanceId !== instanceId);
    
    if (filtered.length === 0) {
      setGridWidgets([]);
      return;
    }

    // Redistribute remaining widgets
    const totalWidgets = filtered.length;
    const colsPerWidget = 12 / totalWidgets; // Use flexible division instead of floor

    const redistributed = filtered.map((widget, index) => ({
      ...widget,
      cols: colsPerWidget,
      rows: GRID_ROWS,
      row: 0,
      col: index * colsPerWidget,
    }));

    setGridWidgets(redistributed);
  };

  const handleMouseUp = () => {
    // No-op with flexbox layout
  };

  const handleMouseMoveResize = () => {
    // No-op with flexbox layout
  };

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

          {/* Dropdown Modal with Click Outside Handler */}
          {openWidget && (
            <>
              {/* Invisible overlay to catch clicks outside modal */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpenWidget(false)}
              />
              
              {/* Modal */}
              <div className="absolute top-14 right-0 bg-slate-800 border border-gray-600 rounded-lg shadow-2xl p-6 w-96 z-50">
                <div className="grid grid-cols-3 gap-6">
                  {availableWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="flex flex-col items-center cursor-pointer hover:opacity-80 transition"
                      onClick={() => handleAddWidget(widget)}
                    >
                      <div className={`${widget.color} w-24 h-24 rounded-lg mb-3 shadow-lg hover:shadow-xl transition`}></div>
                      <span className="text-white text-xs font-medium text-center">{widget.name}</span>
                      <span className="text-gray-400 text-xs mt-2">{widget.defaultCols}×{widget.defaultRows}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Grid Container */}
      <div 
        ref={gridContainerRef}
        className="flex-1 m-6 border border-gray-400 rounded-lg p-6 overflow-hidden bg-slate-800 bg-opacity-50"
        onMouseMove={handleMouseMoveResize}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {gridWidgets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Select a widget from Add Widget button to get started</p>
          </div>
        ) : (
          <div
            className="w-full h-full gap-4 p-2 flex"
            style={{
              backgroundColor: 'rgba(100, 116, 139, 0.1)',
              borderRadius: '0.5rem',
            }}
          >
            {gridWidgets.map((widget) => (
              <div
                key={widget.instanceId}
                className={`${widget.color} rounded-lg shadow-lg p-4 flex flex-col items-center justify-center relative group hover:shadow-xl transition user-select-none flex-1`}
                style={{
                  minHeight: '80px',
                }}
              >
                <p className="text-white font-semibold text-center text-sm pointer-events-none">{widget.name}</p>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveWidget(widget.instanceId)}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

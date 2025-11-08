'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import ResizableWidgetContainer from '@/components/ResizableWidgetContainer';

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
    return allWidgets;
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

    // Add new widget
    const updatedWidgets = redistributeAllWidgets(newWidget);
    setGridWidgets(updatedWidgets);
    setOpenWidget(false);
  };

  const handleRemoveWidget = (instanceId: string) => {
    const filtered = gridWidgets.filter((w) => w.instanceId !== instanceId);
    setGridWidgets(filtered);
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
        className="flex-1 m-6 border border-gray-400 rounded-lg p-2 overflow-hidden bg-slate-800 bg-opacity-50"
      >
        {gridWidgets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Select a widget from Add Widget button to get started</p>
          </div>
        ) : (
          <ResizableWidgetContainer
            key={gridWidgets.length}
            gap={2}
            widgets={gridWidgets.map((widget) => ({
              id: widget.instanceId,
              content: (
                <div className={`${widget.color} rounded-lg shadow-lg flex flex-col relative group hover:shadow-xl transition user-select-none overflow-hidden h-full`}>
                  {/* Header Section - 50px */}
                  <div className="h-12 border-b border-white border-opacity-20 flex items-center justify-between px-4">
                    <p className="text-white font-semibold text-sm pointer-events-none">{widget.name}</p>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveWidget(widget.instanceId)}
                      className="p-1 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    {/* Widget content goes here */}
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </div>
    </main>
  );
}

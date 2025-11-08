'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface Widget {
  id: number;
  name: string;
  color: string;
  defaultCols: number;
  defaultRows: number;
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

interface DragState {
  isDragging: boolean;
  instanceId: string | null;
  startX: number;
  startY: number;
  startRow: number;
  startCol: number;
  offsetX: number;
  offsetY: number;
}

export default function LayoutPage() {
  const [openWidget, setOpenWidget] = useState(false);
  const [gridWidgets, setGridWidgets] = useState<GridWidget[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    instanceId: null,
    startX: 0,
    startY: 0,
    startRow: 0,
    startCol: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const GRID_COLS = 12;
  const GRID_ROWS = 4;

  const availableWidgets: Widget[] = [
    { id: 1, name: 'Chart', color: 'bg-blue-500', defaultCols: 6, defaultRows: 2 },
    { id: 2, name: 'Option Chain', color: 'bg-purple-500', defaultCols: 4, defaultRows: 2 },
    { id: 3, name: 'Positions', color: 'bg-green-500', defaultCols: 3, defaultRows: 2 },
    { id: 4, name: 'Orders', color: 'bg-orange-500', defaultCols: 3, defaultRows: 1 },
    { id: 5, name: 'Market Depth', color: 'bg-red-500', defaultCols: 4, defaultRows: 2 },
    { id: 6, name: 'Market Watch', color: 'bg-pink-500', defaultCols: 3, defaultRows: 2 },
  ];

  // Find the next available position on the grid
  const findNextAvailablePosition = (cols: number, rows: number): { row: number; col: number } | null => {
    // Try to place widget from left to right, top to bottom
    for (let row = 0; row < GRID_ROWS - rows + 1; row++) {
      for (let col = 0; col < GRID_COLS - cols + 1; col++) {
        // Check if this position is available
        const isAvailable = gridWidgets.every((widget) => {
          const widgetEndRow = widget.row + widget.rows;
          const widgetEndCol = widget.col + widget.cols;
          const newEndRow = row + rows;
          const newEndCol = col + cols;

          return (
            newEndRow <= widget.row || // New widget is above
            row >= widgetEndRow || // New widget is below
            newEndCol <= widget.col || // New widget is to the left
            col >= widgetEndCol // New widget is to the right
          );
        });

        if (isAvailable) {
          return { row, col };
        }
      }
    }
    return null;
  };

  const handleAddWidget = (widget: Widget) => {
    const position = findNextAvailablePosition(widget.defaultCols, widget.defaultRows);

    if (position) {
      const newWidget: GridWidget = {
        widgetId: widget.id,
        instanceId: `${widget.id}-${Date.now()}`,
        name: widget.name,
        color: widget.color,
        cols: widget.defaultCols,
        rows: widget.defaultRows,
        row: position.row,
        col: position.col,
      };

      setGridWidgets([...gridWidgets, newWidget]);
      setOpenWidget(false);
    } else {
      alert('Not enough space to add this widget!');
    }
  };

  const handleRemoveWidget = (instanceId: string) => {
    setGridWidgets(gridWidgets.filter((w) => w.instanceId !== instanceId));
  };

  const handleMouseDown = (e: React.MouseEvent, instanceId: string) => {
    if (!gridContainerRef.current) return;

    const widget = gridWidgets.find((w) => w.instanceId === instanceId);
    if (!widget) return;

    const rect = gridContainerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragState({
      isDragging: true,
      instanceId,
      startX: e.clientX,
      startY: e.clientY,
      startRow: widget.row,
      startCol: widget.col,
      offsetX,
      offsetY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !gridContainerRef.current || !dragState.instanceId) return;

    const rect = gridContainerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const widget = gridWidgets.find((w) => w.instanceId === dragState.instanceId);
    if (!widget) return;

    // Calculate grid cell size
    const cellWidth = rect.width / GRID_COLS;
    const cellHeight = rect.height / GRID_ROWS;

    // Calculate which grid cell we're hovering over
    let newCol = Math.floor(currentX / cellWidth);
    let newRow = Math.floor(currentY / cellHeight);

    // Clamp to valid grid positions
    newCol = Math.max(0, Math.min(newCol, GRID_COLS - widget.cols));
    newRow = Math.max(0, Math.min(newRow, GRID_ROWS - widget.rows));

    // Update widget position
    setGridWidgets(
      gridWidgets.map((w) =>
        w.instanceId === dragState.instanceId ? { ...w, row: newRow, col: newCol } : w
      )
    );
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      instanceId: null,
      startX: 0,
      startY: 0,
      startRow: 0,
      startCol: 0,
      offsetX: 0,
      offsetY: 0,
    });
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

          {/* Dropdown Modal */}
          {openWidget && (
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
          )}
        </div>
      </div>

      {/* Main Grid Container */}
      <div 
        ref={gridContainerRef}
        className="flex-1 m-6 border border-gray-400 rounded-lg p-6 overflow-hidden bg-slate-800 bg-opacity-50"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {gridWidgets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Select a widget from Add Widget button to get started</p>
          </div>
        ) : (
          <div
            className="w-full h-full gap-4 p-2"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              gridAutoRows: `minmax(80px, 1fr)`,
              gridAutoColumns: `minmax(1fr, 1fr)`,
              backgroundColor: 'rgba(100, 116, 139, 0.1)',
              borderRadius: '0.5rem',
              backgroundImage: `
                linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px),
                linear-gradient(180deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: `${100 / GRID_COLS}% ${100 / GRID_ROWS}%`,
            }}
          >
            {gridWidgets.map((widget) => (
              <div
                key={widget.instanceId}
                className={`${widget.color} rounded-lg shadow-lg p-4 flex flex-col items-center justify-center relative group hover:shadow-xl transition user-select-none ${
                  dragState.isDragging && dragState.instanceId === widget.instanceId
                    ? 'opacity-75 cursor-grabbing'
                    : 'cursor-grab'
                }`}
                style={{
                  gridColumn: `${widget.col + 1} / span ${widget.cols}`,
                  gridRow: `${widget.row + 1} / span ${widget.rows}`,
                  minHeight: '80px',
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleMouseDown(e, widget.instanceId);
                }}
              >
                <p className="text-white font-semibold text-center text-sm pointer-events-none">{widget.name}</p>
                <p className="text-white text-xs opacity-70 pointer-events-none">({widget.cols}×{widget.rows})</p>

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

'use client';

import { useState, useRef, ReactNode, useEffect } from 'react';

interface ResizableWidgetContainerProps {
  widgets: Array<{
    id: string;
    content: ReactNode;
    onWidthChange?: (newWidth: number) => void;
  }>;
  gap?: number;
  className?: string;
}

export default function ResizableWidgetContainer({
  widgets,
  gap = 2,
  className = '',
}: ResizableWidgetContainerProps) {
  // Initialize widths based on current widget count
  const initialWidths = widgets.map(() => 100 / widgets.length);
  const [widths, setWidths] = useState<number[]>(initialWidths);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBorderIndex, setDraggedBorderIndex] = useState<number | null>(null);
  const startXRef = useRef(0);
  const startWidthsRef = useRef<number[]>([]);

  const handleMouseDownBorder = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggedBorderIndex(index);
    startXRef.current = e.clientX;
    startWidthsRef.current = [...widths];
  };

  // Handle document-level mouse events with useEffect
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (draggedBorderIndex === null || !containerRef.current) {
        return;
      }

      const deltaX = e.clientX - startXRef.current;
      const containerWidth = containerRef.current.offsetWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;

      const newWidths = [...startWidthsRef.current];
      const leftIndex = draggedBorderIndex;
      const rightIndex = draggedBorderIndex + 1;

      // Get minimum width (at least 10% to be useful)
      const minWidth = 10;

      // Calculate new widths
      const leftNewWidth = newWidths[leftIndex] + deltaPercent;
      const rightNewWidth = newWidths[rightIndex] - deltaPercent;

      // Apply constraints
      if (leftNewWidth >= minWidth && rightNewWidth >= minWidth) {
        newWidths[leftIndex] = leftNewWidth;
        newWidths[rightIndex] = rightNewWidth;
        setWidths(newWidths);
      }
    };

    const handleMouseUpGlobal = () => {
      setIsDragging(false);
      setDraggedBorderIndex(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUpGlobal);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, draggedBorderIndex]);

  return (
    <div ref={containerRef} className={`flex h-full w-full ${className}`} style={{ gap: `${gap}px` }}>
      {widgets.map((widget, index) => (
        <div key={widget.id} className="flex items-stretch shrink-0 relative group" style={{ width: `${widths[index]}%` }}>
          {/* Widget Content */}
          <div className="w-full h-full flex-1">{widget.content}</div>

          {/* Resizable Border (only show if not the last widget) */}
          {index < widgets.length - 1 && (
            <div
              onMouseDown={(e) => handleMouseDownBorder(index, e)}
              className={`w-0.5 bg-gray-600 hover:bg-gray-400 cursor-col-resize transition-all duration-150 ${
                draggedBorderIndex === index ? 'bg-gray-300' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                marginLeft: `${gap / 2}px`,
                marginRight: `${gap / 2}px`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

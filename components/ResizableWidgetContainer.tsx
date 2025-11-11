'use client';

import { useState, useRef, ReactNode, useEffect, useMemo, useCallback } from 'react';

interface ResizableWidgetContainerProps {
  widgets: Array<{
    id: string;
    content: ReactNode;
    onWidthChange?: (newWidth: number) => void;
  }>;
  gap?: number;
  className?: string;
  onReorderWidgets?: (newOrder: string[]) => void;
}

// Tree-based layout structure
interface LayoutNode {
  type: 'leaf' | 'split';
  widgetId?: string;
  direction?: 'horizontal' | 'vertical';
  children?: LayoutNode[];
  flexSizes?: number[]; // Flex proportions for children
}

interface DropZoneInfo {
  widgetId: string;
  position: 'left' | 'right' | 'top' | 'bottom' | null;
}

export default function ResizableWidgetContainer({
  widgets,
  gap = 2,
  className = '',
  onReorderWidgets,
}: ResizableWidgetContainerProps) {
  // Helper function to get display name from widget ID (instanceId format)
  const getWidgetDisplayName = (widgetId: string): string => {
    // Extract the actual widget type from instanceId (format: "widgetId-index-timestamp")
    const widgetTypeId = parseInt(widgetId.split('-')[0]);
    const nameMap: { [key: number]: string } = {
      1: 'Chart',
      2: 'Options',
      3: 'Positions',
      4: 'Orders',
      5: 'Market Depth',
      6: 'Market Watch',
    };
    return nameMap[widgetTypeId] || widgetId;
  };

  // Initialize layout tree with widgets in horizontal arrangement
  const initializeLayout = useCallback((): LayoutNode => {
    if (widgets.length === 0) return { type: 'leaf', widgetId: '' };
    if (widgets.length === 1) return { type: 'leaf', widgetId: widgets[0].id };

    return {
      type: 'split',
      direction: 'horizontal',
      children: widgets.map((widget) => ({
        type: 'leaf' as const,
        widgetId: widget.id,
      })),
    };
  }, [widgets]);

  const [layout, setLayout] = useState<LayoutNode>(initializeLayout());
  const [isDraggingWidget, setIsDraggingWidget] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dropZone, setDropZone] = useState<DropZoneInfo>({ widgetId: '', position: null });
  const [previewDimensions, setPreviewDimensions] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [hasDragMovement, setHasDragMovement] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingData, setResizingData] = useState<{ nodeId: string; childIndex: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const resizeStartPosRef = useRef({ x: 0, y: 0 });
  const resizeStartSizesRef = useRef<number[] | null>(null);

  // Remove widget from layout
  const removeWidget = (node: LayoutNode, widgetId: string): LayoutNode => {
    if (node.type === 'leaf') {
      return node;
    }
    if (node.type === 'split' && node.children) {
      const filtered = node.children
        .filter((child) => !(child.type === 'leaf' && child.widgetId === widgetId))
        .map((child) => removeWidget(child, widgetId));

      if (filtered.length === 0) return { type: 'leaf', widgetId: '' };
      if (filtered.length === 1) return filtered[0];

      return { ...node, children: filtered };
    }
    return node;
  };

  // Insert widget at drop zone
  const insertWidget = (node: LayoutNode, widgetId: string, dropZoneInfo: DropZoneInfo): LayoutNode => {
    if (dropZoneInfo.position === null) return node;

    if (node.type === 'leaf' && node.widgetId === dropZoneInfo.widgetId) {
      // Create split at this position
      const direction =
        dropZoneInfo.position === 'left' || dropZoneInfo.position === 'right'
          ? 'horizontal'
          : 'vertical';

      const children = [node];

      if (dropZoneInfo.position === 'right' || dropZoneInfo.position === 'bottom') {
        children.push({ type: 'leaf' as const, widgetId });
      } else {
        children.unshift({ type: 'leaf' as const, widgetId });
      }

      return {
        type: 'split' as const,
        direction,
        children,
      };
    }

    if (node.type === 'split' && node.children) {
      return {
        ...node,
        children: node.children.map((child) => insertWidget(child, widgetId, dropZoneInfo)),
      };
    }

    return node;
  };

  // Handle drop
  const handleDrop = useCallback(() => {
    if (!draggedWidgetId || dropZone.position === null) {
      setIsDraggingWidget(false);
      setDraggedWidgetId(null);
      setDropZone({ widgetId: '', position: null });
      setHasDragMovement(false);
      return;
    }

    // Remove widget from current position, then insert at drop zone
    let newLayout = removeWidget(layout, draggedWidgetId);
    newLayout = insertWidget(newLayout, draggedWidgetId, dropZone);

    setLayout(newLayout);

    // Extract new widget order and call callback
    const extractOrder = (node: LayoutNode): string[] => {
      if (node.type === 'leaf') {
        return node.widgetId ? [node.widgetId] : [];
      }
      return (node.children || []).flatMap((child) => extractOrder(child));
    };

    const newOrder = extractOrder(newLayout);
    if (onReorderWidgets) {
      onReorderWidgets(newOrder);
    }

    setIsDraggingWidget(false);
    setDraggedWidgetId(null);
    setDropZone({ widgetId: '', position: null });
    setHasDragMovement(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggedWidgetId, dropZone, layout, onReorderWidgets]);

  // Calculate preview dimensions based on drop zone
  const calculatePreviewDimensions = useCallback(
    (dropZoneInfo: DropZoneInfo): { x: number; y: number; width: number; height: number } | null => {
      if (dropZoneInfo.position === null) return null;

      const targetElement = nodeRefsRef.current.get(dropZoneInfo.widgetId);
      if (!targetElement || !containerRef.current) return null;

      const targetRect = targetElement.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const relX = (targetRect.left - containerRect.left) / containerRect.width * 100;
      const relY = (targetRect.top - containerRect.top) / containerRect.height * 100;
      const relWidth = (targetRect.width / containerRect.width) * 100;
      const relHeight = (targetRect.height / containerRect.height) * 100;

      // Calculate dimensions based on position
      if (dropZoneInfo.position === 'left') {
        return {
          x: relX,
          y: relY,
          width: relWidth / 2,
          height: relHeight,
        };
      } else if (dropZoneInfo.position === 'right') {
        return {
          x: relX + relWidth / 2,
          y: relY,
          width: relWidth / 2,
          height: relHeight,
        };
      } else if (dropZoneInfo.position === 'top') {
        return {
          x: relX,
          y: relY,
          width: relWidth,
          height: relHeight / 2,
        };
      } else if (dropZoneInfo.position === 'bottom') {
        return {
          x: relX,
          y: relY + relHeight / 2,
          width: relWidth,
          height: relHeight / 2,
        };
      }

      return null;
    },
    []
  );

  // Detect drop zone based on cursor
  const detectDropZone = useCallback(
    (e: MouseEvent): DropZoneInfo => {
      let closestZone: DropZoneInfo = { widgetId: '', position: null };

      nodeRefsRef.current.forEach((element, widgetId) => {
        if (widgetId === draggedWidgetId) return;

        const rect = element.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;

        // Check if cursor is in this element
        if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
          const relXPercent = (relX / rect.width) * 100;
          const relYPercent = (relY / rect.height) * 100;

          let position: 'left' | 'right' | 'top' | 'bottom' | null = null;

          // Priority: vertical zones first (33% each from top/bottom)
          if (relYPercent < 33) {
            position = 'top';
          } else if (relYPercent > 67) {
            position = 'bottom';
          } else if (relXPercent < 33) {
            position = 'left';
          } else if (relXPercent > 67) {
            position = 'right';
          }

          if (position) {
            closestZone = { widgetId, position };
            return;
          }
        }
      });

      return closestZone;
    },
    [draggedWidgetId]
  );

  // Mouse move handler
  useEffect(() => {
    if (!isDraggingWidget && !isResizing) return;

    const DRAG_THRESHOLD = 5; // pixels - minimum movement to show drop zone

    const handleMouseMove = (e: MouseEvent) => {
      // Handle resize
      if (isResizing && resizingData && resizeStartSizesRef.current) {
        const deltaX = e.clientX - resizeStartPosRef.current.x;
        const deltaY = e.clientY - resizeStartPosRef.current.y;
        
        setLayout((prevLayout) => {
          if (resizingData.nodeId === '0' && prevLayout.type === 'split' && prevLayout.direction) {
            const isHorizontal = prevLayout.direction === 'horizontal';
            const delta = isHorizontal ? deltaX : deltaY;
            
            const currentFlexSizes = [...(prevLayout.flexSizes || Array(prevLayout.children?.length || 1).fill(1))];
            const totalFlex = currentFlexSizes.reduce((sum, size) => sum + size, 0);
            
            if (containerRef.current) {
              const containerSize = isHorizontal ? containerRef.current.clientWidth : containerRef.current.clientHeight;
              
              const pixelSizes = currentFlexSizes.map((flex) => {
                const percentage = (flex / totalFlex) * 100;
                return (containerSize * percentage) / 100;
              });
              
              pixelSizes[resizingData.childIndex] += delta;
              pixelSizes[resizingData.childIndex + 1] -= delta;
              
              const minSize = containerSize * 0.1;
              pixelSizes[resizingData.childIndex] = Math.max(minSize, pixelSizes[resizingData.childIndex]);
              pixelSizes[resizingData.childIndex + 1] = Math.max(minSize, pixelSizes[resizingData.childIndex + 1]);
              
              const newFlexSizes = pixelSizes.map((pixels) => pixels / containerSize * 100);
              
              return {
                ...prevLayout,
                flexSizes: newFlexSizes,
              };
            }
          }
          return prevLayout;
        });
        
        resizeStartPosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // Handle drag widget reordering
      if (!isDraggingWidget) return;

      // Check if user has dragged far enough
      const deltaX = Math.abs(e.clientX - dragStartPosRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPosRef.current.y);
      const hasMovedEnough = deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD;

      if (!hasMovedEnough) {
        // Don't show drop zone until threshold is met
        setDropZone({ widgetId: '', position: null });
        setPreviewDimensions(null);
        return;
      }

      // Mark that we've started real dragging
      if (!hasDragMovement) {
        setHasDragMovement(true);
      }

      const zone = detectDropZone(e);
      setDropZone(zone);
      
      // Calculate and update preview dimensions
      if (zone.position !== null) {
        const preview = calculatePreviewDimensions(zone);
        setPreviewDimensions(preview);
      } else {
        setPreviewDimensions(null);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        setResizingData(null);
        resizeStartSizesRef.current = null;
        return;
      }
      handleDrop();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingWidget, isResizing, resizingData, detectDropZone, calculatePreviewDimensions, handleDrop, hasDragMovement]);

  // Calculate dimensions for layout nodes
  const calculateDimensions = useCallback(
    (node: LayoutNode, parentWidth: number, parentHeight: number): Map<string, { x: number; y: number; width: number; height: number }> => {
      const dimensions = new Map<string, { x: number; y: number; width: number; height: number }>();

      const traverse = (
        currentNode: LayoutNode,
        x: number,
        y: number,
        width: number,
        height: number
      ) => {
        if (currentNode.type === 'leaf' && currentNode.widgetId) {
          dimensions.set(currentNode.widgetId, { x, y, width, height });
          return;
        }

        if (currentNode.type === 'split' && currentNode.children) {
          const childCount = currentNode.children.length;
          const isHorizontal = currentNode.direction === 'horizontal';
          
          // Get flex sizes, default to equal distribution
          const flexSizes = currentNode.flexSizes || Array(childCount).fill(1);
          const totalFlex = flexSizes.reduce((sum, size) => sum + size, 0);

          currentNode.children.forEach((child, index) => {
            const flexProportion = flexSizes[index] / totalFlex;
            
            if (isHorizontal) {
              const childWidth = width * flexProportion;
              const childX = x + (index === 0 ? 0 : currentNode.children!.slice(0, index).reduce((sum, _, i) => sum + (width * (flexSizes[i] / totalFlex)), 0));
              traverse(child, childX, y, childWidth, height);
            } else {
              const childHeight = height * flexProportion;
              const childY = y + (index === 0 ? 0 : currentNode.children!.slice(0, index).reduce((sum, _, i) => sum + (height * (flexSizes[i] / totalFlex)), 0));
              traverse(child, x, childY, width, childHeight);
            }
          });
        }
      };

      traverse(node, 0, 0, parentWidth, parentHeight);
      return dimensions;
    },
    []
  );

  // Render layout tree - use a regular recursive function
  const renderLayoutHelper = (node: LayoutNode, dimensions: Map<string, { x: number; y: number; width: number; height: number }>, pathId: string = '0'): React.ReactNode => {
    if (node.type === 'leaf' && node.widgetId) {
      const widget = widgets.find((w) => w.id === node.widgetId);
      if (!widget) return null;

      const dim = dimensions.get(node.widgetId) || { x: 0, y: 0, width: 100, height: 100 };

      return (
        <div
          key={node.widgetId}
          ref={(el) => {
            if (el && node.widgetId) nodeRefsRef.current.set(node.widgetId, el);
          }}
          style={{
            position: 'absolute',
            left: `${dim.x}%`,
            top: `${dim.y}%`,
            width: `${dim.width}%`,
            height: `${dim.height}%`,
            padding: `${gap / 2}px`,
            opacity: draggedWidgetId === node.widgetId ? 0.5 : 1,
            borderLeft: dropZone.widgetId === node.widgetId && dropZone.position === 'left' ? '4px solid white' : '1px solid #1a1a1a',
            borderRight: dropZone.widgetId === node.widgetId && dropZone.position === 'right' ? '4px solid white' : '1px solid #1a1a1a',
            borderTop: dropZone.widgetId === node.widgetId && dropZone.position === 'top' ? '4px solid white' : '1px solid #1a1a1a',
            borderBottom: dropZone.widgetId === node.widgetId && dropZone.position === 'bottom' ? '4px solid white' : '1px solid #1a1a1a',
            transition: dropZone.widgetId === node.widgetId && dropZone.position !== null ? 'all 0.2s ease-out' : 'none',
          }}
          onMouseDown={(e) => {
            const target = e.target as HTMLElement;
            const headerDiv = target.closest('.bg-slate-900');

            if (headerDiv && !target.closest('button') && node.widgetId) {
              setIsDraggingWidget(true);
              setDraggedWidgetId(node.widgetId);
              dragStartPosRef.current = { x: e.clientX, y: e.clientY };
            }
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {widget.content}
          </div>
        </div>
      );
    }

    if (node.type === 'split' && node.children) {
      const childCount = node.children.length;
      const isHorizontal = node.direction === 'horizontal';
      const flexSizes = node.flexSizes || Array(childCount).fill(1);
      const totalFlex = flexSizes.reduce((sum, size) => sum + size, 0);

      // Calculate cumulative positions for resize handles
      const cumulativePositions = Array(childCount)
        .fill(0)
        .map((_, i) => {
          let sum = 0;
          for (let j = 0; j <= i; j++) {
            sum += (flexSizes[j] / totalFlex) * 100;
          }
          return sum;
        });

      return (
        <div key={`split-${pathId}`}>
          {node.children.map((child, idx) => (
            <div key={`child-${pathId}-${idx}`}>
              {renderLayoutHelper(child, dimensions, `${pathId}-${idx}`)}
              
              {/* Render resize handle between siblings */}
              {idx < node.children!.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    width: isHorizontal ? '8px' : '100%',
                    height: isHorizontal ? '100%' : '8px',
                    cursor: isHorizontal ? 'col-resize' : 'row-resize',
                    backgroundColor: 'transparent',
                    zIndex: 50,
                    transition: 'background-color 0.2s ease',
                    // Position the resize handle
                    left: isHorizontal ? `calc(${cumulativePositions[idx]}% - 4px)` : '0',
                    top: !isHorizontal ? `calc(${cumulativePositions[idx]}% - 4px)` : '0',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsResizing(true);
                    setResizingData({ nodeId: pathId, childIndex: idx });
                    resizeStartPosRef.current = { x: e.clientX, y: e.clientY };
                    resizeStartSizesRef.current = [...flexSizes];
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isResizing) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }
                  }}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // Get dimensions for rendering
  const containerDimensions = useMemo(
    () => calculateDimensions(layout, 100, 100),
    [layout, calculateDimensions]
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{
        position: 'relative',
        userSelect: isDraggingWidget ? 'none' : 'auto',
      }}
    >
      {renderLayoutHelper(layout, containerDimensions)}
      
      {/* Preview container during drag */}
      {isDraggingWidget && previewDimensions && draggedWidgetId && hasDragMovement && (
        <div
          style={{
            position: 'absolute',
            left: `${previewDimensions.x}%`,
            top: `${previewDimensions.y}%`,
            width: `${previewDimensions.width}%`,
            height: `${previewDimensions.height}%`,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '2px dashed rgb(59, 130, 246)',
            borderRadius: '8px',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            padding: `${gap / 2}px`,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgb(59, 130, 246)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              maxWidth: '90%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {getWidgetDisplayName(draggedWidgetId)}
          </div>
        </div>
      )}
    </div>
  );
}

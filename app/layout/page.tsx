'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import ResizableWidgetContainer from '@/components/ResizableWidgetContainer';
import ChartWidget from '@/components/widgets/ChartWidget';
import OptionChainWidget from '@/components/widgets/OptionChainWidget';
import PositionsWidget from '@/components/widgets/PositionsWidget';
import OrdersWidget from '@/components/widgets/OrdersWidget';
import MarketDepthWidget from '@/components/widgets/MarketDepthWidget';
import MarketWatchWidget from '@/components/widgets/MarketWatchWidget';
import OrderFormModal from '@/components/OrderFormModal';
import WidgetPreviewSmall from '@/components/WidgetPreviewSmall';
import LayoutTabs from '@/components/LayoutTabs';
import LayoutTemplateSelector from '@/components/LayoutTemplateSelector';
import { getLayout, updateLayoutWidgets, updateLayout } from '@/lib/layoutStorage';
import { GridWidget } from '@/types/layout';

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

// Get widget component based on widget ID
const getWidgetComponent = (widgetId: number) => {
  switch (widgetId) {
    case 1:
      return <ChartWidget />;
    case 2:
      return <OptionChainWidget />;
    case 3:
      return <PositionsWidget />;
    case 4:
      return <OrdersWidget />;
    case 5:
      return <MarketDepthWidget />;
    case 6:
      return <MarketWatchWidget />;
    default:
      return null;
  }
};

export default function LayoutPage() {
  const searchParams = useSearchParams();
  const templateParam = searchParams?.get('template');
  const layoutIdParam = searchParams?.get('layoutId');
  const templateId = templateParam ? parseInt(templateParam) : null;

  const GRID_ROWS = 4;

  const availableWidgets = useMemo<Widget[]>(() => [
    { id: 1, name: 'Chart', color: 'bg-blue-500', defaultCols: 6, defaultRows: 2, minCols: 4, maxCols: 12, minRows: 1, maxRows: 4 },
    { id: 2, name: 'Option Chain', color: 'bg-purple-500', defaultCols: 4, defaultRows: 2, minCols: 3, maxCols: 8, minRows: 1, maxRows: 4 },
    { id: 3, name: 'Positions', color: 'bg-green-500', defaultCols: 3, defaultRows: 2, minCols: 2, maxCols: 6, minRows: 1, maxRows: 3 },
    { id: 4, name: 'Orders', color: 'bg-orange-500', defaultCols: 3, defaultRows: 1, minCols: 2, maxCols: 6, minRows: 1, maxRows: 2 },
    { id: 5, name: 'Market Depth', color: 'bg-red-500', defaultCols: 4, defaultRows: 2, minCols: 3, maxCols: 8, minRows: 1, maxRows: 4 },
    { id: 6, name: 'Market Watch', color: 'bg-pink-500', defaultCols: 3, defaultRows: 2, minCols: 2, maxCols: 6, minRows: 1, maxRows: 4 },
  ], []);

  const templateConfigs = useMemo<{ [key: number]: number[] }>(() => ({
    1: [], // Blank Layout
    2: [1, 6], // Chart & Market Watch
    3: [3, 4, 5], // Trading Dashboard (Positions, Orders, Market Depth)
    4: [2, 1, 6], // Option Chain Pro (Option Chain, Chart, Market Watch)
  }), []);

  const [openWidget, setOpenWidget] = useState(false);
  const [gridWidgets, setGridWidgets] = useState<GridWidget[]>([]);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [layoutInitialized, setLayoutInitialized] = useState(false);
  const initializedRef = useRef(false);
  const addWidgetButtonRef = useRef<HTMLButtonElement>(null);

  // Load layout when layoutId changes
  useEffect(() => {
    if (layoutIdParam) {
      const layout = getLayout(layoutIdParam);
      if (layout) {
        setGridWidgets(layout.widgets);
        // Reset initialized flag based on whether layout has widgets
        setLayoutInitialized(layout.widgets.length > 0 || layout.initialized === true);
      } else {
        setGridWidgets([]);
        setLayoutInitialized(false);
      }
    }
  }, [layoutIdParam]);

  // Initialize with template if provided and layout is empty
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    // If we have a template, initialize from template
    if (templateId && templateId !== 1 && gridWidgets.length === 0) {
      const widgetsToAdd = templateConfigs[templateId] || [];

      if (widgetsToAdd.length > 0) {
        const newWidgets = widgetsToAdd.map((widgetId, index) => {
          const widget = availableWidgets.find((w) => w.id === widgetId);
          if (!widget) return null;

          const totalWidgets = widgetsToAdd.length;
          const colsPerWidget = 12 / totalWidgets;
          const colPosition = index * colsPerWidget;

          return {
            widgetId: widget.id,
            instanceId: `${widgetId}-${index}-${Date.now()}`,
            name: widget.name,
            color: widget.color,
            cols: colsPerWidget,
            rows: GRID_ROWS,
            row: 0,
            col: colPosition,
          };
        }).filter((w) => w !== null) as GridWidget[];

        setGridWidgets(newWidgets);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  // Persist layout changes whenever gridWidgets changes
  useEffect(() => {
    if (layoutIdParam) {
      updateLayoutWidgets(layoutIdParam, gridWidgets);
    }
  }, [gridWidgets, layoutIdParam]);

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
    // Special handling for Order Form (widget ID 7)
    if (widget.id === 7) {
      setIsOrderFormOpen(true);
      setOpenWidget(false);
      return;
    }

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

  const handleReorderWidgets = (newWidgetIds: string[]) => {
    // Reorder gridWidgets based on the new order of IDs
    const reorderedWidgets = newWidgetIds
      .map((id) => gridWidgets.find((w) => w.instanceId === id))
      .filter((w) => w !== undefined) as GridWidget[];
    
    setGridWidgets(reorderedWidgets);
  };

  const handleSelectTemplate = (selectedTemplateId: number) => {
    // Get the template config
    const widgetsToAdd = templateConfigs[selectedTemplateId] || [];

    if (widgetsToAdd.length > 0) {
      const newWidgets = widgetsToAdd.map((widgetId, index) => {
        const widget = availableWidgets.find((w) => w.id === widgetId);
        if (!widget) return null;

        const totalWidgets = widgetsToAdd.length;
        const colsPerWidget = 12 / totalWidgets;
        const colPosition = index * colsPerWidget;

        return {
          widgetId: widget.id,
          instanceId: `${widgetId}-${index}-${Date.now()}`,
          name: widget.name,
          color: widget.color,
          cols: colsPerWidget,
          rows: GRID_ROWS,
          row: 0,
          col: colPosition,
        };
      }).filter((w) => w !== null) as GridWidget[];

      setGridWidgets(newWidgets);
      // Update the layout with new widgets
      if (layoutIdParam) {
        updateLayoutWidgets(layoutIdParam, newWidgets);
      }
    } else {
      // Blank layout - leave empty but open add widget modal
      setOpenWidget(true);
      // Update the layout to mark as initialized
      if (layoutIdParam) {
        updateLayout(layoutIdParam, { initialized: true });
      }
    }
    
    // Mark layout as initialized so template selector won't show again
    setLayoutInitialized(true);
  };



  return (
    <main className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col h-full">
      {/* Layout Tabs with Add Widget Button */}
      <LayoutTabs 
        activeLayoutId={layoutIdParam || undefined}
        showAddWidget={layoutInitialized}
        onAddWidget={() => setOpenWidget(true)}
        addWidgetButtonRef={addWidgetButtonRef}
      />

    

      {/* Add Widget Modal */}
      <div className="relative">
        {/* Dropdown Modal with Click Outside Handler */}
        {openWidget && (
          <>
            {/* Invisible overlay to catch clicks outside modal */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpenWidget(false)}
            />
            
            {/* Modal - positioned below the Add Widget button */}
            <div className="absolute top-full left-auto right-8 mt-2 bg-slate-800 border border-gray-600 rounded-lg shadow-2xl p-6 w-96 z-50">
              <div className="grid grid-cols-3 gap-6">
                {availableWidgets.map((widget) => (
                  <button
                    key={widget.id}
                    className="flex flex-col cursor-pointer group relative"
                    onClick={() => handleAddWidget(widget)}
                    title={`Add ${widget.name} widget`}
                  >
                    {/* Widget Preview - 100x100px */}
                    <div className="w-24 h-24 bg-slate-700 border border-gray-600 rounded-lg overflow-hidden relative group-hover:border-blue-500 group-hover:shadow-lg transition-all duration-200">
                      <WidgetPreviewSmall widgetId={widget.id} />
                    </div>
                    {/* Widget Name Only */}
                    <div className="mt-2">
                      <span className="text-white text-xs font-medium block text-center">{widget.name}</span>
                    </div>
                  </button>
                ))}

                {/* Order Form Widget */}
                <button
                  className="flex flex-col cursor-pointer group relative"
                  onClick={() => handleAddWidget({ id: 7, name: 'Order Form', color: 'bg-indigo-600', defaultCols: 0, defaultRows: 0, minCols: 0, maxCols: 0, minRows: 0, maxRows: 0 })}
                  title="Open Order Form Modal"
                >
                  {/* Preview */}
                  <div className="w-24 h-24 bg-indigo-900 border border-indigo-600 rounded-lg overflow-hidden relative group-hover:border-indigo-400 group-hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center">
                    <div className="text-2xl">📝</div>
                  </div>
                  {/* Widget Name Only */}
                  <div className="mt-2">
                    <span className="text-white text-xs font-medium block text-center">Order Form</span>
                  </div>
                </button>
              </div>

              {/* Modal Footer */}
              <div className="mt-4 pt-3 border-t border-gray-700">
                <p className="text-gray-400 text-xs text-center">Click any widget to add it to your dashboard</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Grid Container */}
      <div 
        className="flex-1 m-6 rounded-lg p-2 overflow-hidden bg-slate-800 bg-opacity-50 flex flex-col"
      >
        {gridWidgets.length === 0 && !layoutInitialized ? (
          <LayoutTemplateSelector onSelectTemplate={handleSelectTemplate} />
        ) : gridWidgets.length === 0 && layoutInitialized ? (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-400 text-lg">Select a widget from Add Widget button to get started</p>
          </div>
        ) : (
          <ResizableWidgetContainer
            key={gridWidgets.length}
            gap={2}
            widgets={gridWidgets.map((widget) => ({
              id: widget.instanceId,
              content: (
                <div className="rounded-lg shadow-lg flex flex-col relative group hover:shadow-xl transition user-select-none overflow-hidden h-full bg-slate-800 border border-gray-700">
                  {/* Header Section */}
                  <div className="h-12 border-b border-white border-opacity-10 flex items-center justify-between px-4 bg-slate-900 cursor-grab active:cursor-grabbing">
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
                  <div className="flex-1 overflow-hidden w-full bg-slate-800">
                    {getWidgetComponent(widget.widgetId)}
                  </div>
                </div>
              ),
            }))}
            onReorderWidgets={handleReorderWidgets}
          />
        )}
      </div>

      {/* Order Form Modal - Controlled by state */}
      <OrderFormModal 
        isOpen={isOrderFormOpen} 
        onClose={() => setIsOrderFormOpen(false)}
      />
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { CustomLayout } from '@/types/layout';
import { getAllLayouts, createLayout, deleteLayout, renameLayout } from '@/lib/layoutStorage';

interface LayoutTabsProps {
  activeLayoutId?: string;
  onAddWidget?: () => void;
  showAddWidget?: boolean;
  addWidgetButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function LayoutTabs({ activeLayoutId, onAddWidget, showAddWidget = false, addWidgetButtonRef }: LayoutTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [layouts, setLayouts] = useState<CustomLayout[]>(() => {
    const allLayouts = getAllLayouts();
    // Ensure at least one default layout exists
    if (allLayouts.length === 0) {
      const defaultLayout = createLayout('New layout', []);
      return [defaultLayout];
    }
    return allLayouts;
  });

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');

  const layoutIdFromUrl = searchParams?.get('layoutId');
  const currentActiveId = activeLayoutId || layoutIdFromUrl;

  // Navigate to first layout if no layout is selected
  useEffect(() => {
    if (!currentActiveId && layouts.length > 0) {
      router.push(`/layout?layoutId=${layouts[0].id}`);
    }
  }, [currentActiveId, layouts, router]);

  const handleSelectLayout = (layoutId: string) => {
    // If already selected, allow rename on next click
    if (currentActiveId === layoutId && renamingId !== layoutId) {
      // Second click on active tab - enable rename
      setRenamingId(layoutId);
      const layout = layouts.find((l) => l.id === layoutId);
      if (layout) {
        setRenamingValue(layout.name);
      }
    } else if (currentActiveId !== layoutId) {
      // First click - select the layout
      router.push(`/layout?layoutId=${layoutId}`);
    }
  };

  const handleSaveRename = (layoutId: string) => {
    if (renamingValue.trim()) {
      const updated = renameLayout(layoutId, renamingValue.trim());
      if (updated) {
        setLayouts(layouts.map((l) => (l.id === layoutId ? updated : l)));
      }
    }
    setRenamingId(null);
    setRenamingValue('');
  };

  const handleDeleteLayout = (e: React.MouseEvent, layoutId: string) => {
    e.stopPropagation();
    
    // Delete immediately without confirmation
    deleteLayout(layoutId);
    const updated = layouts.filter((l) => l.id !== layoutId);
    setLayouts(updated);

    // If deleted layout was active, switch to first available or create new one
    if (currentActiveId === layoutId) {
      if (updated.length > 0) {
        router.push(`/layout?layoutId=${updated[0].id}`);
      } else {
        // If no layouts left, create a new one
        const newLayout = createLayout('New layout', []);
        setLayouts([newLayout]);
        router.push(`/layout?layoutId=${newLayout.id}`);
      }
    }
  };

  const handleAddNewLayout = () => {
    const newLayout = createLayout('New layout', []);
    setLayouts([...layouts, newLayout]);
    // Push to the new layout - it will have empty widgets, so template selector will show
    void router.push(`/layout?layoutId=${newLayout.id}`);
  };

  if (!layouts) {
    return <div className="h-16 bg-slate-900 border-b border-gray-700 animate-pulse" />;
  }

  return (
    <div className="bg-slate-900 border-b border-gray-700 px-4 py-4 flex items-center gap-2 overflow-x-auto">
      {/* Layout Chips */}
      <div className="flex items-center gap-2">
        {layouts.map((layout) => (
          <div
            key={layout.id}
            onClick={() => handleSelectLayout(layout.id)}
            className={`group px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              currentActiveId === layout.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            {renamingId === layout.id ? (
              <input
                type="text"
                value={renamingValue}
                onChange={(e) => setRenamingValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => handleSaveRename(layout.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveRename(layout.id);
                  } else if (e.key === 'Escape') {
                    setRenamingId(null);
                  }
                }}
                className="bg-slate-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-xs border border-blue-400"
                autoFocus
              />
            ) : (
              <>
                <span className="truncate max-w-xs">{layout.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLayout(e, layout.id);
                  }}
                  className={`p-1 hover:bg-red-500 rounded-full transition-colors text-white ${
                    currentActiveId === layout.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  title="Delete layout"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Layout Button */}
      <button
        onClick={handleAddNewLayout}
        className="ml-2 p-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 rounded-full transition-all duration-200"
        title="Add new layout"
      >
        <Plus size={18} />
      </button>

      {/* Add Widget Button - Only show if layout is initialized */}
      <button
        ref={addWidgetButtonRef}
        onClick={() => onAddWidget?.()}
        className={`ml-auto px-4 py-2 text-gray-400 border border-gray-600 hover:border-gray-400 hover:text-white rounded transition-all duration-200 ${
          showAddWidget && currentActiveId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none h-0'
        }`}
        title="Add widget"
      >
        + Add Widget
      </button>
    </div>
  );
}

import { CustomLayout, GridWidget } from '@/types/layout';

const LAYOUT_STORAGE_KEY = 'thak_layouts';

// Generate a UUID-like ID
export const generateLayoutId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all layouts from localStorage
export const getAllLayouts = (): CustomLayout[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as CustomLayout[];
  } catch (error) {
    console.error('Error loading layouts:', error);
    return [];
  }
};

// Get a specific layout by ID
export const getLayout = (layoutId: string): CustomLayout | null => {
  const layouts = getAllLayouts();
  return layouts.find((l) => l.id === layoutId) || null;
};

// Create a new layout
export const createLayout = (name: string, widgets: GridWidget[] = []): CustomLayout => {
  const layout: CustomLayout = {
    id: generateLayoutId(),
    name,
    widgets,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const layouts = getAllLayouts();
  layouts.push(layout);
  saveLayouts(layouts);

  return layout;
};

// Update a layout
export const updateLayout = (layoutId: string, updates: Partial<CustomLayout>): CustomLayout | null => {
  const layouts = getAllLayouts();
  const index = layouts.findIndex((l) => l.id === layoutId);

  if (index === -1) return null;

  const updated = {
    ...layouts[index],
    ...updates,
    updatedAt: Date.now(),
  };

  layouts[index] = updated;
  saveLayouts(layouts);

  return updated;
};

// Delete a layout
export const deleteLayout = (layoutId: string): boolean => {
  const layouts = getAllLayouts();
  const filtered = layouts.filter((l) => l.id !== layoutId);

  if (filtered.length === layouts.length) return false;

  saveLayouts(filtered);
  return true;
};

// Rename a layout
export const renameLayout = (layoutId: string, newName: string): CustomLayout | null => {
  return updateLayout(layoutId, { name: newName });
};

// Update widgets in a layout
export const updateLayoutWidgets = (layoutId: string, widgets: GridWidget[]): CustomLayout | null => {
  return updateLayout(layoutId, { widgets });
};

// Save layouts to localStorage
const saveLayouts = (layouts: CustomLayout[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
  } catch (error) {
    console.error('Error saving layouts:', error);
  }
};

// Initialize with default layout if none exist
export const initializeDefaultLayout = (): CustomLayout => {
  const layouts = getAllLayouts();

  if (layouts.length === 0) {
    return createLayout('Layout 1', []);
  }

  return layouts[0];
};

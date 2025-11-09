export interface GridWidget {
  widgetId: number;
  instanceId: string;
  name: string;
  color: string;
  cols: number;
  rows: number;
  row: number;
  col: number;
}

export interface CustomLayout {
  id: string; // UUID
  name: string;
  widgets: GridWidget[];
  createdAt: number;
  updatedAt: number;
  initialized?: boolean; // Flag to track if a template was selected
}

export interface LayoutStore {
  layouts: CustomLayout[];
  activeLayoutId: string | null;
}

'use client';

import ChartWidget from './widgets/ChartWidget';
import OptionChainWidget from './widgets/OptionChainWidget';
import PositionsWidget from './widgets/PositionsWidget';
import OrdersWidget from './widgets/OrdersWidget';
import MarketDepthWidget from './widgets/MarketDepthWidget';
import MarketWatchWidget from './widgets/MarketWatchWidget';

interface WidgetPreviewProps {
  widgetId: number;
}

export default function WidgetPreview({ widgetId }: WidgetPreviewProps) {
  // Create a small container that simulates the widget
  const getWidgetComponent = (id: number) => {
    switch (id) {
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

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-600 bg-slate-800">
      {getWidgetComponent(widgetId)}
    </div>
  );
}

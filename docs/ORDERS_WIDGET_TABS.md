# Orders & Trades Widget - Tab Implementation

## Overview

The OrdersWidget now displays three tabs: **Pending Orders**, **Completed Orders**, and **Trades**. Each tab shows relevant data with real-time auto-refresh capabilities.

## Features

✅ **Three-Tab Interface**
- Pending: Shows active/open orders
- Completed: Shows filled, rejected, and cancelled orders
- Trades: Shows executed trades with fill prices

✅ **Real-Time Updates**
- Auto-refresh every 5 seconds (configurable)
- Live order count badges on tabs
- Manual refresh support

✅ **Responsive Design**
- Horizontal scrolling table for wide data
- Mobile-friendly tab navigation
- Clean status indicators

✅ **Smart Data Handling**
- Auto-detection of client ID from localStorage
- Separate API calls for each data type
- Efficient caching and state management

## Component Structure

```
OrdersWidget
├── Tab Navigation (Pending, Completed, Trades)
│   ├── Tab badges with count
│   └── Active tab indicator (blue highlight)
├── Content Area
│   ├── Empty state message
│   └── Data Table
│       ├── Orders Table (Pending/Completed)
│       │   ├── ID, Type, Symbol, Qty, Price, Status, Time
│       │   └── Color-coded status indicators
│       └── Trades Table
│           ├── ID, Type, Symbol, Qty, Price, Order Price, Time
│           └── Additional trade-specific columns
```

## Data Display

### Pending Orders
Shows orders awaiting execution with yellow status indicator.

| Column | Content |
|--------|---------|
| ID | Order identifier |
| Type | BUY (green) / SELL (red) |
| Sym | Stock symbol |
| Qty | Order quantity |
| Price | Limit/Market price |
| Status | PENDING, OPEN, etc. |
| Time | Order entry time |

### Completed Orders
Shows filled, rejected, and cancelled orders.

| Column | Content |
|--------|---------|
| ID | Order identifier |
| Type | BUY (green) / SELL (red) |
| Sym | Stock symbol |
| Qty | Order quantity |
| Price | Order price |
| Status | COMPLETE, FILLED, REJECTED, CANCELLED |
| Time | Order entry time |

### Trades
Shows executed trades with actual fill prices.

| Column | Content |
|--------|---------|
| ID | Trade number |
| Type | BUY (green) / SELL (red) |
| Sym | Stock symbol |
| Qty | Trade quantity |
| Price | Actual fill price |
| Order | Original order price |
| Time | Trade execution time |

## Usage

### Basic Usage (Already in Dashboard)
```typescript
import OrdersWidget from '@/components/widgets/OrdersWidget';

export default function Dashboard() {
  return (
    <div className="w-full h-full">
      <OrdersWidget />
    </div>
  );
}
```

### Customizing Refresh Interval

Edit `components/widgets/OrdersWidget.tsx`:

```typescript
// Change from 5000 to desired interval (in milliseconds)
const { orders: completedOrders } = useOrders({
  clientId,
  orderType: 'completed',
  autoRefresh: true,
  refreshInterval: 3000, // 3 seconds instead of 5
});
```

## API Integrations

### Orders API
- **Endpoint**: `GET /api/v1/orders`
- **Params**: `type=pending|completed&client_id=<ID>`
- **Header**: `x-authorization-token` (from login)

### Trades API
- **Endpoint**: `GET /api/v1/trades`
- **Params**: `client_id=<ID>`
- **Header**: `x-authorization-token` (from login)

## Tab Switching Logic

```typescript
const getDisplayData = () => {
  switch (activeTab) {
    case 'pending':
      return { data: pendingOrders, isPending: true };
    case 'completed':
      return { data: completedOrders, isPending: false };
    case 'trades':
      return { data: trades, isTrade: true };
    default:
      return { data: [], isPending: false };
  }
};
```

When switching tabs:
1. Component renders appropriate header row
2. Maps over correct data source (trades vs orders)
3. Displays empty state if no data
4. Shows live count badges for each tab

## Tab Badge Behavior

Each tab displays:
- **Label**: Pending, Completed, or Trades
- **Count Badge**: Live count of items (updates every 5 seconds)
- **Active Indicator**: Blue border-bottom on active tab

```
┌─────────────────────────────────────────┐
│ Pending (3) │ Completed (8) │ Trades (12) │ ← Tab badges with counts
│━━━━━━━━━━━━│               │             │ ← Active tab indicator
├─────────────────────────────────────────┤
│ Order data table...                     │
└─────────────────────────────────────────┘
```

## Styling Details

### Tab Navigation
- **Active Tab**: Blue text (#3b82f6) with blue bottom border
- **Inactive Tab**: Gray text (#9ca3af) that lightens on hover
- **Count Badge**: Colored background matching tab state
- **Scrollable**: Horizontal scroll on mobile devices

### Status Colors
- **BUY Orders**: Green (#22c55e)
- **SELL Orders**: Red (#ef4444)
- **Filled Status**: Green background with checkmark icon
- **Pending Status**: Yellow background with clock icon
- **Rejected Status**: Red background with X icon

### Layout
- **Widget Height**: Full container height
- **Responsive**: Works on all screen sizes
- **Scrollable Content**: Both axes when needed
- **Sticky Headers**: Column headers stay visible when scrolling

## Performance Considerations

### Memory Usage
- Each hook maintains separate state
- Auto-refresh uses efficient interval cleanup
- No memory leaks on component unmount

### API Load
- Default: 3 API calls (one per tab) every 5 seconds
- Total: ~1 KB/request × 3 = 3 KB per refresh
- Network: Minimal impact for real-time updates

### Optimization Tips
1. Increase `refreshInterval` to 10-30 seconds for less frequent updates
2. Use manual refresh instead of auto-refresh for lower traffic
3. Implement virtual scrolling if lists exceed 500 items

## Empty States

### No Data
```
┌─────────────────────────┐
│ Pending │ Completed ... │
├─────────────────────────┤
│                         │
│  No pending orders      │ ← Centered, muted text
│                         │
└─────────────────────────┘
```

### Loading State
Component shows data from previous tab switch while API request is in progress (no loading spinner needed since data updates smoothly).

## Authentication

All API calls automatically include:
- **Header**: `x-authorization-token` (managed by AuthContext)
- **Device Type**: `x-device-type: web`
- **Content-Type**: `application/json`

If token expires:
- Component shows empty state
- Manual refresh will trigger re-authentication flow
- User needs to re-login

## Files Involved

**Core Component**:
- `components/widgets/OrdersWidget.tsx` - Main widget with tabs

**Order Management**:
- `lib/api/orders.ts` - Order API utilities
- `lib/hooks/useOrders.ts` - Order data hook

**Trade Management**:
- `lib/api/trades.ts` - Trade API utilities
- `lib/hooks/useTrades.ts` - Trade data hook

**Shared**:
- `lib/axios.ts` - API configuration
- `lib/currencyFormatter.ts` - INR formatting
- `lib/auth/AuthContext.tsx` - Authentication

## Customization Examples

### Disable Auto-Refresh
```typescript
const { orders } = useOrders({
  clientId,
  orderType: 'completed',
  autoRefresh: false, // Manual refresh only
});
```

### Adjust Refresh Interval
```typescript
const { trades, refresh } = useTrades({
  clientId,
  autoRefresh: true,
  refreshInterval: 10000, // 10 seconds
});
```

### Filter Data Client-Side
```typescript
const completedOnly = completedOrders.filter(
  o => o.status === 'COMPLETE'
);

const tradesBySymbol = trades.filter(
  t => t.symbol === 'SBIN'
);
```

## Browser DevTools Debugging

### Check Active Tab
```javascript
// In browser console
document.querySelectorAll('[class*="border-blue"]'); // Shows active tab
```

### Inspect API Calls
1. Open DevTools → Network tab
2. Filter by XHR
3. Watch `/api/v1/orders` and `/api/v1/trades` requests
4. Check response payloads and timings

### Check Component State
```javascript
// React DevTools needed
// Right-click widget → "Inspect" → Props tab
// See activeTab, pendingOrders, completedOrders, trades
```

## Troubleshooting

### Tabs show but no data?
- Check browser console for errors
- Verify user is authenticated
- Check Network tab for API response errors
- See `ORDERS_API_TROUBLESHOOTING.md`

### Counts not updating?
- Check if auto-refresh is enabled
- Verify `refreshInterval` is set correctly
- Check browser network throttling in DevTools

### Wrong data showing?
- Verify active tab matches displayData
- Check console for state management errors
- Ensure API endpoints are correct

### Performance issues with large lists?
- Increase refresh interval
- Reduce viewport size (virtual scrolling)
- Disable auto-refresh and use manual refresh
- Check browser memory usage in DevTools

## Related Documentation

- **Orders Implementation**: `docs/ORDERS_IMPLEMENTATION.md`
- **Orders Troubleshooting**: `docs/ORDERS_API_TROUBLESHOOTING.md`
- **Orders Reference**: `docs/ORDERS_WIDGET_REFERENCE.md`

## Version Info

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4

---

**Status**: ✅ Production Ready  
**Last Updated**: November 12, 2025  
**Features**: 
- ✅ Pending Orders Tab
- ✅ Completed Orders Tab
- ✅ Trades Tab
- ✅ Real-time Auto-refresh
- ✅ Live Count Badges
- ✅ Responsive Design

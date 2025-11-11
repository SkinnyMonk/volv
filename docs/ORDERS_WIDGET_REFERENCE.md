# Orders Widget - Quick Reference

## Overview

The Orders Widget displays a real-time list of trading orders from the broker API. It integrates seamlessly with the authentication system and automatically refreshes order data.

## Key Features

✅ Real-time order updates (5-second refresh)  
✅ Filter by completed/pending/all orders  
✅ Display order details: symbol, type, quantity, price, status  
✅ Color-coded status indicators  
✅ Automatic error handling and logging  
✅ Responsive table layout  
✅ Manual refresh button support  

## Component Location

**Component**: `components/widgets/OrdersWidget.tsx`  
**API Utils**: `lib/api/orders.ts`  
**React Hook**: `lib/hooks/useOrders.ts`

## Quick Usage

### In a Page or Dashboard

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

### In Another Component with Custom Config

```typescript
import { useOrders } from '@/lib/hooks/useOrders';

export function MyOrders() {
  const { orders, isLoading, refresh } = useOrders({
    clientId: 'MS3122',
    orderType: 'pending',  // 'completed', 'pending', or 'all'
    autoRefresh: true,
    refreshInterval: 3000, // 3 seconds
  });

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          {order.symbol}: {order.quantity} @ {order.price}
        </div>
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## API Response Data

The API returns order data with these key fields:

```typescript
{
  // Identifiers
  oms_order_id: string;      // Order ID
  nnf_id: number;            // Network ID
  
  // Symbol Info
  display_symbol: string;    // "SBIN"
  trading_symbol: string;    // "SBIN-EQ"
  instrument_token: number;  // Token ID
  
  // Order Details
  order_side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  order_type: 'MARKET' | 'LIMIT' | 'SLM';
  
  // Execution
  filled_quantity: number;
  average_price: number;
  remaining_quantity: number;
  
  // Status
  order_status: 'COMPLETE' | 'REJECTED' | 'PENDING' | etc;
  rejection_reason: string;  // Why order was rejected
  
  // Trading Details
  product: 'CNC' | 'MIS' | 'BO' | 'CO';
  exchange: 'NSE' | 'BSE' | 'NFO' | 'MCX';
  validity: 'DAY' | 'IOC';
  
  // Timestamps
  order_entry_time: number;  // Unix timestamp
  exchange_time: number;
}
```

## Order Status Values

| Status | Meaning | Display |
|--------|---------|---------|
| COMPLETE | Order filled completely | ✓ Green |
| FILLED | Order partially/fully filled | ✓ Green |
| PENDING | Order awaiting execution | ⏱ Yellow |
| REJECTED | Order rejected by exchange | ✕ Red |
| CANCEL_CONFIRMED | Order cancelled | ✕ Red |
| AMO_CANCEL_CONFIRMED | AMO order cancelled | ✕ Red |

## Display Order Fields

After transformation, orders have these UI-friendly fields:

```typescript
interface DisplayOrder {
  id: string;                // Shortened order ID
  symbol: string;            // Stock symbol
  type: 'BUY' | 'SELL';      // Order direction
  quantity: number;          // Total quantity
  filledQuantity: number;    // Filled amount
  price: number;             // Order price
  averagePrice: number;      // Average fill price
  status: string;            // Current status
  time: string;              // Formatted timestamp
  timestamp: number;         // Unix timestamp
  
  // Additional fields
  tradingSymbol: string;
  orderType: string;
  exchange: string;
  product: string;
  rejectionReason: string;
  triggerPrice: number;
  validity: string;
  executionType: string;
}
```

## Handling 401 Auth Errors

**Problem**: Getting 401 errors when fetching orders

**Solution**: Ensure authentication is complete
1. User must be logged in first
2. Auth token is set in localStorage
3. Check DevTools → Application → LocalStorage for `authToken`

**For Debugging**:
```javascript
// In browser console
const token = localStorage.getItem('authToken');
console.log('Token exists:', !!token);

// Try API call directly
import { fetchOrders } from '@/lib/api/orders';
const orders = await fetchOrders('completed', 'MS3122');
console.log(orders);
```

## Common Customizations

### Change Auto-Refresh Interval

```typescript
const { orders } = useOrders({
  clientId: 'MS3122',
  autoRefresh: true,
  refreshInterval: 10000, // 10 seconds instead of 5
});
```

### Disable Auto-Refresh

```typescript
const { orders, refresh } = useOrders({
  clientId: 'MS3122',
  autoRefresh: false,  // Manual refresh only
});

// Refresh manually when needed
<button onClick={refresh}>Fetch Latest</button>
```

### Filter Orders Client-Side

```typescript
const { orders } = useOrders({ clientId, orderType: 'all' });

// Filter BUY orders only
const buyOrders = orders.filter(o => o.type === 'BUY');

// Filter filled orders
const filledOrders = orders.filter(
  o => o.filledQuantity > 0
);
```

## Table Column Meanings

| Column | Meaning |
|--------|---------|
| ID | Order identifier (shortened) |
| Type | BUY (green) or SELL (red) |
| Symbol | Stock symbol (e.g., SBIN) |
| Qty | Order quantity |
| Price | Order price in INR |
| Status | Current order status with icon |
| Time | Order entry time |

## Performance Tips

1. **Large order lists**: The table handles 100+ orders efficiently
2. **Frequent updates**: Keep refresh at 5+ seconds for 99% of uses
3. **Manual triggers**: Use manual refresh for user-initiated updates

## Troubleshooting

### Orders not loading?
- Check if user is authenticated
- Check browser console for errors
- Verify API endpoint is accessible
- See `ORDERS_API_TROUBLESHOOTING.md`

### Data looks stale?
- Click "Refresh" button manually
- Check refresh interval setting
- Verify network tab shows fresh requests

### Too many API calls?
- Increase `refreshInterval` value
- Set `autoRefresh: false` for manual control
- Monitor network tab in DevTools

## Related Files

- **Widget**: `components/widgets/OrdersWidget.tsx`
- **API**: `lib/api/orders.ts`
- **Hook**: `lib/hooks/useOrders.ts`
- **Auth**: `lib/auth/AuthContext.tsx`
- **Axios Config**: `lib/axios.ts`
- **Troubleshooting**: `docs/ORDERS_API_TROUBLESHOOTING.md`

## API Endpoints

```
GET https://zyro.basanonline.com/api/v1/orders?type=completed&client_id=MS3122
GET https://zyro.basanonline.com/api/v1/orders?type=pending&client_id=MS3122
GET https://zyro.basanonline.com/api/v1/orders?type=all&client_id=MS3122
```

**Headers Required**:
- `x-authorization-token`: JWT token from login
- `x-device-type`: web
- `Content-Type`: application/json

## Version Info

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4

---

For detailed troubleshooting, see `ORDERS_API_TROUBLESHOOTING.md`

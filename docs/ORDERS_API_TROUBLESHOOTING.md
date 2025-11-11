# Order API Integration - Troubleshooting Guide

## 401 Unauthorized Error

The 401 error indicates that the authentication token is either missing, expired, or invalid.

### Causes & Solutions

#### 1. **Auth Token Not Set**
- **Symptom**: 401 error on first order fetch after app reload
- **Cause**: Token not loaded from localStorage or auth context
- **Solution**: 
  - Ensure you're logged in first
  - Check browser DevTools → Application → LocalStorage for `authToken` key
  - Login flow should set the token before accessing protected APIs

#### 2. **Token Expired**
- **Symptom**: 401 after extended use
- **Cause**: JWT token expires (check `exp` claim in JWT)
- **Solution**:
  - Re-login to get a fresh token
  - Token is set via `setAxiosToken()` in auth flow
  - Check `lib/auth/AuthContext.tsx` for token refresh logic

#### 3. **Incorrect Token Format**
- **Symptom**: 401 even with valid token
- **Cause**: Wrong header name or format
- **Solution**:
  - API expects `x-authorization-token` header (NOT `Authorization`)
  - Check `lib/axios.ts` - v1Instance uses `x-authorization-token`
  - Token should be passed as: `x-authorization-token: <jwt_token>`

#### 4. **CORS Issues**
- **Symptom**: 401 with CORS error in network tab
- **Cause**: Cross-origin request blocked
- **Solution**:
  - Ensure API allows CORS from your origin
  - Check API response headers: `Access-Control-Allow-Origin`
  - Add `x-device-type: web` header (already done in axios config)

### Debugging Steps

1. **Check Auth Token in localStorage**:
   ```javascript
   // In browser console
   console.log(localStorage.getItem('authToken'));
   console.log(localStorage.getItem('user'));
   ```

2. **Check Axios Instance Configuration**:
   ```javascript
   // In browser console
   import { apiV1 } from '@/lib/axios'
   console.log(apiV1.defaults.headers);
   console.log(apiV1.defaults.baseURL);
   ```

3. **Check Network Request Headers**:
   - Open DevTools → Network tab
   - Make order API request
   - Check request headers for `x-authorization-token`
   - Check response status and headers

4. **Verify JWT Token**:
   ```javascript
   // Decode JWT in browser console
   const token = localStorage.getItem('authToken');
   const parts = token.split('.');
   const payload = JSON.parse(atob(parts[1]));
   console.log('Token expires at:', new Date(payload.exp * 1000));
   console.log('Current time:', new Date());
   console.log('Token expired?', Date.now() > payload.exp * 1000);
   ```

### API Endpoint Details

**Base URL**: `https://zyro.basanonline.com/api/v1`

**Endpoints**:
- `GET /orders?type=completed&client_id=<CLIENT_ID>`
- `GET /orders?type=pending&client_id=<CLIENT_ID>`

**Required Headers**:
- `x-authorization-token`: JWT token from login
- `x-device-type`: web
- `Content-Type`: application/json

**Example Request**:
```bash
curl 'https://zyro.basanonline.com/api/v1/orders?type=completed&client_id=MS3122' \
  -H 'x-authorization-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'x-device-type: web' \
  -H 'Content-Type: application/json'
```

## Order API Implementation Details

### Files Involved

1. **`lib/api/orders.ts`** - API utility functions
   - `fetchOrders()` - Main fetch function
   - `fetchCompletedOrders()` - Completed orders
   - `fetchPendingOrders()` - Pending orders
   - `transformOrderForDisplay()` - Transform raw data
   - `getOrderStatusInfo()` - Status mapping
   - `filterOrdersByStatus()` - Client-side filtering

2. **`lib/hooks/useOrders.ts`** - React hook
   - `useOrders()` - Main hook for components
   - Auto-refresh every 5 seconds (configurable)
   - Loading/error states
   - Manual refresh function

3. **`components/widgets/OrdersWidget.tsx`** - UI Component
   - Displays orders in table format
   - Shows order details: ID, type, symbol, qty, price, status, time
   - Auto-refreshes from hook

### Hook Usage

```typescript
import { useOrders } from '@/lib/hooks/useOrders';

export function MyComponent() {
  const { orders, isLoading, error, lastUpdate, refresh } = useOrders({
    clientId: 'MS3122',
    orderType: 'completed',
    autoRefresh: true,
    refreshInterval: 5000,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>{order.symbol} - {order.quantity}</div>
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### Order Status Mapping

| Status | Display | Color | Icon |
|--------|---------|-------|------|
| COMPLETE | Completed | Green | ✓ |
| FILLED | Filled | Green | ✓ |
| REJECTED | Rejected | Red | ✕ |
| PENDING | Pending | Yellow | ⏱ |
| CANCEL_CONFIRMED | Cancelled | Red | ✕ |
| AMO_CANCEL_CONFIRMED | AMO Cancelled | Red | ✕ |

### Data Types

**OrderData** - Raw response from API (70+ fields)
- Contains complete order information
- Matches API response structure
- Includes timestamps in Unix format

**DisplayOrder** - Transformed for UI display
```typescript
{
  id: string;           // Order ID
  symbol: string;       // Trading symbol
  type: 'BUY' | 'SELL'; // Order side
  quantity: number;     // Quantity
  filledQuantity: number;
  price: number;        // Order price
  averagePrice: number; // Filled price
  status: string;       // Order status
  time: string;         // Formatted time
  timestamp: number;    // Unix timestamp
  // ... and more
}
```

## Common Issues & Solutions

### Issue: Orders not updating automatically

**Solution**: Check if auto-refresh is enabled
```typescript
useOrders({
  autoRefresh: true,        // Must be true
  refreshInterval: 5000,    // 5 seconds
})
```

### Issue: Stale data displayed

**Solution**: Call refresh() manually
```typescript
const { orders, refresh } = useOrders({ clientId, orderType });
<button onClick={refresh}>Refresh Now</button>
```

### Issue: Too many API calls

**Solution**: Increase refresh interval
```typescript
useOrders({
  autoRefresh: true,
  refreshInterval: 30000,  // 30 seconds instead of 5
})
```

### Issue: Memory leak warnings

**Solution**: Ensure cleanup in useEffect (already handled in hook)
- Hook automatically clears intervals on unmount
- No memory leaks if used correctly

## Testing

### Test with real API:
```bash
# Get auth token first from login response
TOKEN="your_jwt_token_here"

# Test completed orders
curl 'https://zyro.basanonline.com/api/v1/orders?type=completed&client_id=MS3122' \
  -H "x-authorization-token: $TOKEN" \
  -H 'x-device-type: web'

# Test pending orders
curl 'https://zyro.basanonline.com/api/v1/orders?type=pending&client_id=MS3122' \
  -H "x-authorization-token: $TOKEN" \
  -H 'x-device-type: web'
```

### Test in browser console:
```javascript
import { fetchOrders } from '@/lib/api/orders';

// Fetch completed orders
const orders = await fetchOrders('completed', 'MS3122');
console.log('Orders:', orders);
```

## Performance Considerations

1. **Large datasets**: Orders list can have 100+ items
   - Table uses virtualization for scroll performance
   - Each row is ~50px height, viewport fits ~15 rows

2. **Network**:
   - Default refresh: 5 seconds
   - Can reduce to 2-3 seconds for real-time feel
   - API likely caches responses server-side

3. **Memory**:
   - Hook cleans up intervals on unmount
   - displayOrders computed via useMemo
   - No memory leaks with proper cleanup

## Next Steps

1. ✅ Ensure user is authenticated before accessing orders
2. ✅ Check token expiry and refresh if needed
3. ✅ Verify API endpoint is accessible
4. ✅ Check network tab for request/response details
5. ✅ Review browser console for error messages
6. ✅ Test with provided curl command
7. ✅ Implement token refresh mechanism if needed

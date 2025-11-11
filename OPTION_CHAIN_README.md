# Real-Time Option Chain WebSocket Implementation

## Overview
Implemented real-time option chain data for NIFTY 50 using WebSocket subscriptions through the Octopus broker API. The option chain widget now displays live Greeks data with automatic updates.

## ✅ Implementation Summary

### 1. **WebSocket Hook** (`lib/hooks/useOptionChainWebSocket.ts`)
- **Purpose**: Real-time subscription to GreekData for NIFTY 50 options
- **Configuration**:
  - Exchange: NSE (code: 1)
  - Instrument Token: 26000 (NIFTY 50)
- **Features**:
  - Automatic WebSocket connection management
  - Greek data parsing (delta, gamma, theta, vega, rho)
  - Implied volatility tracking
  - Bid/Ask prices and volumes
  - Open Interest monitoring
  - Sorted by strike price (ascending)

**Key Interface:**
```typescript
export interface OptionChainData {
  strike: number;
  callBid: number;
  callAsk: number;
  callVolume: number;
  callOpenInterest: number;
  callImpliedVolatility: number;
  callGreeks: { delta, gamma, theta, vega, rho };
  putBid: number;
  putAsk: number;
  putVolume: number;
  putOpenInterest: number;
  putImpliedVolatility: number;
  putGreeks: { delta, gamma, theta, vega, rho };
}
```

**Usage:**
```typescript
const { optionChain, isConnected, lastUpdate } = useOptionChainWebSocket(
  'NSE',    // Exchange
  26000     // NIFTY 50 token
);
```

---

### 2. **Option Chain Widget** (`components/widgets/OptionChainWidget.tsx`)
- **Changes**:
  - ✓ Removed mock data generation
  - ✓ Integrated `useOptionChainWebSocket` hook
  - ✓ Updated title to "NIFTY 50 Options Chain"
  - ✓ Added loading state with spinner
  - ✓ Automatic ATM strike detection (based on highest OI)
  - ✓ Real-time data updates

**Features**:
- Live WebSocket data feed
- Responsive table layout (horizontal scrollable)
- Color-coded bid/ask prices (green for bids, red for asks)
- Strike highlighting (ATM strike highlighted in blue)
- Organized columns: Call Bid/Ask, Call Volume, Call OI, Strike, Put Bid/Ask, Put Volume, Put OI

---

### 3. **Backend API Route** (`app/api/widgets/option-chain/route.ts`)
- **Purpose**: Fallback data generation for development/testing
- **Data Generation**:
  - Base price: 24,500 (NIFTY 50 reference)
  - Strike interval: 100 points (standard for NIFTY)
  - Range: ±10 strikes (24,000 to 25,000)
  - Realistic pricing model: Intrinsic value + Time value

**Response Structure:**
```json
{
  "success": true,
  "underlying": {
    "symbol": "NIFTY 50",
    "exchange": "NSE",
    "exchangeCode": 1,
    "token": 26000,
    "price": 24500
  },
  "data": [
    {
      "strike": 24000,
      "callBid": 500.25,
      "callAsk": 505.50,
      "callVolume": 15000,
      "callOpenInterest": 75000,
      "putBid": 5.25,
      "putAsk": 10.50,
      "putVolume": 20000,
      "putOpenInterest": 85000
    },
    ...
  ],
  "metadata": {
    "strikeCount": 21,
    "baseStrike": 24500,
    "minStrike": 24000,
    "maxStrike": 25000
  }
}
```

---

## 📊 Data Flow

```
1. Component Mount (OptionChainWidget)
   ↓
2. useOptionChainWebSocket Hook Initialized
   ├─ Connects to Octopus WebSocket
   └─ Subscribes to GreekData (token: 26000, exchange: 1)
   ↓
3. Real-Time Updates
   ├─ Receive GreekDataMessage from WebSocket
   ├─ Parse: strike, optionType, IV, Greeks, prices, volume
   ├─ Organize by strike
   └─ Update component state
   ↓
4. Component Re-renders
   ├─ Calculate ATM strike (max OI)
   └─ Display option chain table
```

---

## 🔄 WebSocket Subscription Details

**Message Type**: `GreekData`
**Topic Code**: `15` (from `hydra-topic-config.json`)

**Subscription Payload:**
```json
{
  "messageType": "GreekData",
  "payload": {
    "exchangeCode": 1,
    "instrumentToken": 26000
  }
}
```

**Incoming Message Structure:**
```json
{
  "topic": "...",
  "msg": {
    "instrumentToken": 26000,
    "strikePrice": 24500,
    "optionType": "CE/PE",
    "impliedVolatility": 0.25,
    "delta": 0.65,
    "gamma": 0.02,
    "theta": -0.05,
    "vega": 0.15,
    "rho": 0.10,
    "bidPrice": 500.25,
    "askPrice": 505.50,
    "volume": 15000,
    "openInterest": 75000
  }
}
```

---

## 🎯 Key Features

✅ **Real-Time Updates**: Live WebSocket subscription with automatic data refresh
✅ **Greeks Tracking**: Delta, Gamma, Theta, Vega, Rho for both calls and puts
✅ **Implied Volatility**: IV tracking for each strike and option type
✅ **Liquidity Metrics**: Volume and Open Interest for all options
✅ **Bid-Ask Spreads**: Real-time price discovery
✅ **ATM Detection**: Automatic identification of at-the-money strike
✅ **Responsive UI**: Horizontal scrollable table with sticky headers
✅ **Loading States**: Visual feedback while connecting to WebSocket
✅ **Error Handling**: Graceful fallback and error logging

---

## 📝 Customization Guide

### Change Underlying Symbol
To track a different underlying (e.g., BANKNIFTY):

**In `useOptionChainWebSocket.ts`:**
```typescript
useOptionChainWebSocket(
  'NSE',    // Exchange (same)
  26037     // Change token (BANKNIFTY = 26037)
);
```

### Adjust Strike Range
In `app/api/widgets/option-chain/route.ts`:
```typescript
for (let i = -5; i <= 5; i++) { // Change range (±5 instead of ±10)
  const strike = baseStrike + i * 100;
  // ...
}
```

### Add More Columns
In `OptionChainWidget.tsx`, add columns like:
- Implied Volatility (IV)
- Greeks (Delta, Gamma, etc.)
- Risk Metrics

---

## 🚀 Performance Considerations

1. **WebSocket Efficiency**: Single subscription per token
2. **State Updates**: Only updated strikes get re-rendered
3. **Memoization**: ATM strike calculation uses `useMemo`
4. **Cleanup**: Automatic unsubscription on component unmount

---

## ⚠️ Known Limitations & Future Improvements

1. **Expiry Selection**: Currently uses default expiry (can add selector)
2. **Historical Data**: No historical Greeks data (can add charts)
3. **Filtering**: No strike filtering (can add range selector)
4. **Calculations**: No P&L calculations (can add after position selection)
5. **Caching**: No data persistence (can use IndexedDB)

---

## 📚 Related Files

- Configuration: `/lib/exchanges.ts` (exchange codes)
- WebSocket Core: `/lib/octopus/octopusInstance.js`
- Topic Config: `/lib/octopus/hydra-topic-config.json`
- Parent Component: `/app/widgets/option-chain/page.tsx`

---

## ✨ Testing

To test the implementation:

1. Open `/widgets/option-chain` in the browser
2. Check browser console for connection logs
3. Verify data appears in the table
4. Confirm real-time updates as WebSocket messages arrive
5. Check React DevTools for hook state

---

## 📞 Support

For issues or questions:
- Check browser console for `[useOptionChainWebSocket]` logs
- Verify WebSocket connection in Network tab
- Confirm auth token is valid
- Check localStorage for `authToken` and `user`

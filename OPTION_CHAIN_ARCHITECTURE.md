# Option Chain WebSocket Implementation - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     OPTION CHAIN WIDGET                             │
│                   OptionChainWidget.tsx                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    React Component                           │   │
│  │  • useOptionChainWebSocket() Hook                            │   │
│  │  • Fetches real-time data                                    │   │
│  │  • Renders table with 9 columns                              │   │
│  │  • Automatic ATM strike detection                            │   │
│  └────────────────┬─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                     │
                     │ useOptionChainWebSocket()
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   WEBSOCKET HOOK                                    │
│           useOptionChainWebSocket.ts (241 lines)                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  • Manages WebSocket connection                              │   │
│  │  • Parses GreekData messages                                 │   │
│  │  • Organizes data by strike                                  │   │
│  │  • Tracks: Greeks, IV, prices, volumes, OI                   │   │
│  │  • Returns: optionChain[], isConnected, lastUpdate           │   │
│  └────────────────┬─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                     │
                     │ octopusInstance.wsHandler()
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BROKER WEBSOCKET                                  │
│              Octopus Instance (Shared)                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  • GreekData Message Type (code: 15)                         │   │
│  │  • Exchange: NSE (code: 1)                                   │   │
│  │  • Token: 26000 (NIFTY 50)                                   │   │
│  │  • Real-time market data stream                              │   │
│  └────────────────┬─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                     │
                     │ WebSocket Connection
                     │ (ws://broker-endpoint)
                     ▼
         ┌───────────────────────────┐
         │   Broker Market Data       │
         │   (Real-time Greeks)       │
         │   - Delta                  │
         │   - Gamma                  │
         │   - Theta                  │
         │   - Vega                   │
         │   - Rho                    │
         │   - IV                     │
         │   - Bid/Ask                │
         │   - Volumes                │
         │   - Open Interest          │
         └───────────────────────────┘
```

---

## Data Flow Diagram

```
1. INITIALIZATION
   ┌──────────────────────────┐
   │  Component Mounts        │
   │  OptionChainWidget       │
   └────────────┬─────────────┘
                │
                ▼
   ┌──────────────────────────┐
   │  Hook Initialized        │
   │  useOptionChainWebSocket │
   └────────────┬─────────────┘
                │
                ▼
   ┌──────────────────────────┐
   │  Connect WebSocket       │
   │  await octopus.connect() │
   └────────────┬─────────────┘
                │
                ▼
   ┌──────────────────────────────────┐
   │  Subscribe to GreekData          │
   │  Token: 26000, Exchange: 1       │
   │  MessageType: GreekData (15)     │
   └────────────┬─────────────────────┘

2. STREAMING
   ┌──────────────────────────────────────────┐
   │  Broker sends GreekData messages         │
   │  {                                        │
   │    strikePrice: 24500,                    │
   │    optionType: "CE",                      │
   │    delta: 0.65,                           │
   │    gamma: 0.02,                           │
   │    theta: -0.05,                          │
   │    vega: 0.15,                            │
   │    rho: 0.10,                             │
   │    impliedVolatility: 0.25,               │
   │    bidPrice: 500.25,                      │
   │    askPrice: 505.50,                      │
   │    volume: 15000,                         │
   │    openInterest: 75000                    │
   │  }                                        │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌──────────────────────────────────────────┐
   │  Parse Message in handleGreekDataUpdate() │
   │  - Extract strike                         │
   │  - Identify option type (CE/PE)           │
   │  - Parse Greeks and IV                    │
   │  - Extract prices and volumes             │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌──────────────────────────────────────────┐
   │  Update React State                      │
   │  setOptionChain(Map<strike, data>)        │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌──────────────────────────────────────────┐
   │  Component Re-renders                    │
   │  Display updated table                    │
   └──────────────────────────────────────────┘

3. TERMINATION
   ┌──────────────────────────────┐
   │  Component Unmounts          │
   │  (Page navigation, refresh)  │
   └────────────┬─────────────────┘
                │
                ▼
   ┌──────────────────────────────┐
   │  Unsubscribe from GreekData  │
   │  handler.unsubscribe()       │
   └────────────┬─────────────────┘
                │
                ▼
   ┌──────────────────────────────┐
   │  Close WebSocket Connection  │
   │  (if no other subscriptions) │
   └──────────────────────────────┘
```

---

## Table UI Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NIFTY 50 Options Chain                    Expiry: 11/12/2025          │
├─────────────────────────────────────────────────────────────────────────┤
│                         CALLS                │STRK│        PUTS         │
├──────┬──────┬──────┬──────┬──────┼──────┬──────┬──────┬──────┬──────────┤
│ CB   │ CA   │ CV   │ COI  │      │      │ PB   │ PA   │ PV   │ POI      │
├──────┼──────┼──────┼──────┤      ├──────┼──────┼──────┼──────┼──────────┤
│500.2 │505.5 │15000 │75000 │24000 │ 0.2  │ 5.5  │20000 │85000 │          │
│475.0 │480.2 │16000 │70000 │24100 │ 2.5  │ 8.0  │19000 │80000 │          │
│450.0 │455.3 │18000 │65000 │24200 │ 7.8  │12.3  │17000 │75000 │          │
│      │      │      │      │ 24300│      │      │      │      │          │
│250.0 │255.2 │22000 │45000 │24400│150.2 │155.5 │25000 │95000 │ (ATM)    │
│      │      │      │      │ 24500│      │      │      │      │ Highl.   │
│ 30.0 │ 35.2 │25000 │35000 │24600│330.2 │335.5 │23000 │92000 │          │
│ 5.0  │ 10.2 │20000 │30000 │24700│380.0 │385.3 │21000 │88000 │          │
│ 0.2  │ 5.5  │15000 │25000 │24800│425.0 │430.2 │18000 │80000 │          │
│ 0.0  │ 0.5  │10000 │20000 │24900│450.0 │455.3 │16000 │75000 │          │
│ 0.0  │ 0.0  │ 5000 │15000 │25000│475.0 │480.2 │14000 │70000 │          │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────────┘

Legend:
CB   = Call Bid
CA   = Call Ask
CV   = Call Volume
COI  = Call Open Interest
STRK = Strike Price
PB   = Put Bid
PA   = Put Ask
PV   = Put Volume
POI  = Put Open Interest
```

---

## State Management

```
useOptionChainWebSocket Hook State:

optionChain: Map<number, OptionChainData>
├─ 24000: { strike: 24000, callBid: 500.2, ... putGreeks: {...} }
├─ 24100: { strike: 24100, callBid: 475.0, ... putGreeks: {...} }
├─ 24200: { strike: 24200, callBid: 450.0, ... putGreeks: {...} }
│  ...
├─ 24500: { strike: 24500, callBid: 250.0, ... putGreeks: {...} } ← ATM
│  ...
└─ 25000: { strike: 25000, callBid: 0.0,   ... putGreeks: {...} }

isConnected: boolean
├─ true  = WebSocket connected and subscribed
└─ false = Disconnected or connecting

lastUpdate: Date
└─ ISO string of last received message
```

---

## Configuration Constants

```typescript
// Hardcoded Configuration
const EXCHANGE = 'NSE'           // National Stock Exchange
const EXCHANGE_CODE = 1          // Numeric code for NSE
const INSTRUMENT_TOKEN = 26000   // NIFTY 50 index token
const UNDERLYING = 'NIFTY 50'    // Display name
const BASE_PRICE = 24500         // Reference price
const STRIKE_INTERVAL = 100      // Strike spacing (NIFTY standard)
const STRIKE_RANGE = 10          // ±10 strikes from base
const TOTAL_STRIKES = 21         // 21 strikes in chain

// Calculated
const MIN_STRIKE = 24000         // BASE - (10 * 100)
const MAX_STRIKE = 25000         // BASE + (10 * 100)
```

---

## Error Handling

```
WebSocket Connection Errors
├─ Network unavailable
│  └─ Show "Connecting..." spinner
├─ Invalid credentials
│  └─ Redirect to login
├─ Subscription failed
│  └─ Log error, retry automatically
└─ Message parsing error
   └─ Skip message, continue listening

Component Errors
├─ Hook initialization
│  └─ Catch and log, show fallback UI
├─ State update during unmount
│  └─ Check isMounted flag
└─ Memory leaks
   └─ Cleanup subscriptions on unmount
```

---

## Performance Optimizations

```
1. Memoization
   ├─ ATM strike calculation (useMemo)
   └─ Option chain data (Map structure)

2. Efficient Updates
   ├─ Only affected strikes re-render
   ├─ Map for O(1) strike lookup
   └─ No unnecessary re-renders

3. Resource Management
   ├─ Single WebSocket connection
   ├─ Cleanup on unmount
   └─ No memory leaks

4. Data Structure
   ├─ Map for efficient updates
   ├─ Sorted array for display
   └─ Lazy sorting (useMemo)
```

---

## Browser DevTools Inspection

```
React DevTools
├─ OptionChainWidget
│  └─ useOptionChainWebSocket
│     ├─ optionChain: Map(21) {...}
│     ├─ isConnected: true/false
│     └─ lastUpdate: Date

Network Tab
├─ WebSocket connection
│  └─ wss://broker-endpoint/
│     ├─ Initial connection handshake
│     ├─ Subscription request
│     ├─ Incoming GreekData frames
│     └─ Ping/Pong messages

Console
├─ [useOptionChainWebSocket] logs
│  ├─ Connection status
│  ├─ Subscription events
│  ├─ Data updates
│  └─ Error messages
└─ No warnings or errors
```

---

## Integration Points

```
Dependencies On:
├─ lib/octopus/octopusInstance.js
│  └─ WebSocket connection and message handling
├─ lib/exchanges.ts
│  └─ Exchange code mapping (getExchangeCode)
├─ lib/currencyFormatter.ts
│  └─ formatINR() for strike display
└─ React hooks
   └─ useState, useCallback, useEffect, useMemo

Used By:
├─ components/widgets/OptionChainWidget.tsx
│  └─ Display option chain table
└─ app/widgets/option-chain/page.tsx
   └─ Page wrapper
```

---

## Monitoring & Debugging

```
Enable Detailed Logging:
1. Open browser console
2. Search for "[useOptionChainWebSocket]" logs
3. Monitor WebSocket frames in Network tab
4. Check React DevTools for state changes

Debug Checklist:
□ Is WebSocket connected?
□ Are messages being received?
□ Is data being parsed correctly?
□ Are strikes being sorted?
□ Is ATM strike correct?
□ Are Greeks updating?
□ Is component re-rendering?
□ Memory usage stable?
```

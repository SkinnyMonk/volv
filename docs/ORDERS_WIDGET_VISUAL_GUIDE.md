# Orders & Trades Widget - Visual Guide

## Tab Navigation Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Orders & Trades                                             │
├─────────────────────────────────────────────────────────────┤
│ Pending (3) │ Completed (8) │ Trades (12)                  │  ← Tab Headers
│━━━━━━━━━━━━│               │                  (scrollable)  │
├─────────────────────────────────────────────────────────────┤
│ ID    │Type│Sym │ Qty │   Price │ Status  │ Time          │  ← Column Headers
├─────────────────────────────────────────────────────────────┤
│ ORD01 │BUY │SBIN│  50 │  500.50 │ PENDING │ 09:30 AM      │
│ ORD02 │SELL│TCS │  25 │ 3745.00 │ PENDING │ 10:15 AM      │
│ ORD03 │BUY │INFY│  30 │ 2890.00 │ PENDING │ 10:45 AM      │
│       │    │    │     │         │         │               │
│                         ↓ scroll ↓                         │
└─────────────────────────────────────────────────────────────┘
```

## Active Tab Styling

### Default (Completed Tab Active)
```
┌───────────────────────────────────────────────────┐
│ Pending (3) │ Completed (8) │ Trades (12)        │
│             │━━━━━━━━━━━━━━│                     │  ← Blue highlight
│             └─ Active tab with blue indicator    │
└───────────────────────────────────────────────────┘
```

### Hover State (Inactive Tab)
```
Pending (3)
    ↓ (gray text, lightens on hover)
```

## Status Indicators

### Order Status Colors

```
✓ FILLED        → Green ✓    (Filled order)
✓ COMPLETE      → Green ✓    (Order completed)
⏱ PENDING       → Yellow ⏱   (Order waiting)
⏱ OPEN          → Yellow ⏱   (Order open)
✕ REJECTED      → Red ✕      (Order rejected)
✕ CANCELLED     → Red ✕      (Order cancelled)
```

### Order Type Colors

```
BUY  → Green background with green text
SELL → Red background with red text
```

## Column Layout by Tab

### Pending/Completed Orders Tab
```
┌────┬──────┬─────┬─────┬────────┬──────────┬──────┐
│ ID │ Type │ Sym │ Qty │ Price  │ Status   │ Time │
├────┼──────┼─────┼─────┼────────┼──────────┼──────┤
│ .. │ BUY  │ ..  │  .. │ ₹...   │ ✓ FILLED │ ..   │
└────┴──────┴─────┴─────┴────────┴──────────┴──────┘
```

### Trades Tab
```
┌────┬──────┬─────┬─────┬────────┬────────┬──────┐
│ ID │ Type │ Sym │ Qty │ Price  │ Order  │ Time │
├────┼──────┼─────┼─────┼────────┼────────┼──────┤
│ .. │ SELL │ ..  │  .. │ ₹...   │ ₹...   │ ..   │
└────┴──────┴─────┴─────┴────────┴────────┴──────┘
```

## Empty State

```
┌──────────────────────────────┐
│ Pending │ Completed │ Trades │
├──────────────────────────────┤
│                              │
│      No pending orders       │  ← Centered, gray text
│                              │
└──────────────────────────────┘
```

## Responsive Behavior

### Desktop (Wide)
```
Full table visible with all columns
No horizontal scroll needed
```

### Tablet/Mobile
```
Horizontal scroll enabled
Tab headers scroll to show all tabs
Columns maintain min-width for readability
```

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│ Pending │ Completed │ Trades (Click tab)           │
└─────────────────────────────────────────────────────┘
           ↓
    setActiveTab('trades')
           ↓
    getDisplayData() → { data: trades, isTrade: true }
           ↓
    Render trades table with appropriate columns
           ↓
    Auto-refresh every 5 seconds (background)
           ↓
    Update counts and data live
```

## Real-Time Updates

### Before Refresh
```
Pending (3) │ Completed (8) │ Trades (12)
```

### During Auto-Refresh (every 5 seconds)
```
Step 1: API call triggered
Step 2: New data fetched
Step 3: State updated
Step 4: Counts and rows updated
Step 5: Display refreshes (smooth)
```

### After New Order Placed
```
Pending (3) → Pending (4)  ← Count updates automatically
```

## Interactive Elements

### Tab Button States

**Inactive (Default)**
```
Pending (3)
- Gray text (#9ca3af)
- No bottom border
- Cursor: pointer
```

**Hover**
```
Pending (3)
- Lighter gray text (#d1d5db)
- No bottom border yet
- Cursor: pointer
```

**Active**
```
Completed (8)
━━━━━━━━━━━
- Blue text (#3b82f6)
- Blue bottom border
- Cursor: default
```

## Count Badge Styling

```
┌─────────┬──────────┬────────┐
│Pending  │Completed │ Trades │
│   ┌──┐  │  ┌──┐    │ ┌──┐   │
│   │ 3│  │  │ 8│    │ │12│   │  ← Badge shows count
│   └──┘  │  └──┘    │ └──┘   │
└─────────┴──────────┴────────┘
     ↓
  Inactive: gray background
  Active:   blue background
```

## Scroll Behavior

### Horizontal Scroll (Table)
- Activated when table width > container width
- Column headers stay visible
- Status column sticky on right (for visibility)

### Vertical Scroll (Table)
- Activated when rows > 10 (approx)
- Header row stays sticky at top
- Smooth scrolling

### Tab Header Scroll
- Only if tabs overflow horizontally
- Smooth scrolling behavior

## Animation & Transitions

```
Tab Switch Animation:
- Smooth color transition: 150ms
- No flash or flicker
- Data appears immediately

Hover Effects:
- Row background lightens: 200ms
- Text opacity change: smooth

Tab Badge Update:
- Count change: instant
- No animation needed
```

## Accessibility Features

```
✓ Keyboard Navigation
  - Tab key moves between buttons
  - Enter/Space to activate tab

✓ Screen Reader Support
  - Tab labels are descriptive
  - Count badges are read aloud

✓ Color Contrast
  - All text meets WCAG AA standards
  - Icons + text (not color only)

✓ Focus Indicators
  - Clear focus ring on buttons
  - Blue outline visible on tab buttons
```

## Mobile Layout Optimization

```
Mobile (< 768px):
┌─────────────────────────────┐
│ Orders & Trades             │
├─────────────────────────────┤
│ Pending │ Completed │ Trade │  ← Scrollable tabs
├─────────────────────────────┤
│ ID │Type│ Sym │ Qty │ ...    │  ← Scrollable table
│────┼────┼─────┼─────┼────    │
│ .. │ .. │ ..  │  .. │ ..     │
└─────────────────────────────┘

Tablet (768px - 1024px):
┌───────────────────────────────────────┐
│ Orders & Trades                        │
├───────────────────────────────────────┤
│ Pending (3) │ Completed (8) │ Trades   │  ← All visible
├───────────────────────────────────────┤
│ ID │Type│Sym │ Qty │ Price │ Status   │  ← Mostly visible
└───────────────────────────────────────┘

Desktop (> 1024px):
┌──────────────────────────────────────────────┐
│ Orders & Trades                               │
├──────────────────────────────────────────────┤
│ Pending (3) │ Completed (8) │ Trades (12)   │
├──────────────────────────────────────────────┤
│ ID │Type│Sym │ Qty │ Price │ Status │Time   │  ← All visible
└──────────────────────────────────────────────┘
```

## Status Badge Reference

### Pending Tab
```
PENDING (Yellow)
┌──────────────────────┐
│ ⏱ PENDING           │
│ (Clock icon + text)  │
└──────────────────────┘
```

### Completed Tab
```
FILLED (Green)              REJECTED (Red)
┌──────────┐              ┌──────────┐
│ ✓ FILLED │              │ ✕ REJECT │
└──────────┘              └──────────┘

COMPLETED (Green)           CANCELLED (Red)
┌──────────────┐          ┌──────────────┐
│ ✓ COMPLETE   │          │ ✕ CANCELLED  │
└──────────────┘          └──────────────┘
```

### Trades Tab
```
Just shows BUY/SELL type indicators
No separate status column
```

## Related Components

```
OrdersWidget
├── useOrders Hook (Pending)
├── useOrders Hook (Completed)
├── useTrades Hook
├── Tab Navigation UI
├── Empty State UI
└── Data Table UI
    ├── Header Row
    └── Data Rows (20+ per page, scrollable)
```

---

## Quick Reference: What Each Tab Shows

| Tab | API Call | Displays | Refresh |
|-----|----------|----------|---------|
| Pending | `/orders?type=pending` | Open orders waiting to execute | 5s |
| Completed | `/orders?type=completed` | Filled, rejected, cancelled orders | 5s |
| Trades | `/trades` | All executed trades with actual prices | 5s |

---

**Last Updated**: November 12, 2025

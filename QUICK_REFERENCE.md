# Option Chain WebSocket - Quick Reference

## 🚀 Quick Start

```typescript
import { useOptionChainWebSocket } from '@/lib/hooks/useOptionChainWebSocket';

const { optionChain, isConnected, lastUpdate } = useOptionChainWebSocket('NSE', 26000);
```

## 📊 Configuration

| Parameter | Value |
|-----------|-------|
| Underlying | NIFTY 50 |
| Exchange | NSE (1) |
| Token | 26000 |
| Message Type | GreekData (15) |
| Strike Interval | 100 points |

## 📈 Data Fields

### Call Options
- `callBid` - Bid price
- `callAsk` - Ask price  
- `callVolume` - Trading volume
- `callOpenInterest` - Open contracts
- `callImpliedVolatility` - IV
- `callGreeks` - Delta, Gamma, Theta, Vega, Rho

### Put Options
- `putBid` - Bid price
- `putAsk` - Ask price
- `putVolume` - Trading volume
- `putOpenInterest` - Open contracts
- `putImpliedVolatility` - IV
- `putGreeks` - Delta, Gamma, Theta, Vega, Rho

## 🔄 Hook Returns

```typescript
{
  optionChain: OptionChainData[],      // Sorted by strike
  isConnected: boolean,                 // WebSocket status
  lastUpdate: Date                      // Last message time
}
```

## 📍 File Locations

| File | Purpose |
|------|---------|
| `lib/hooks/useOptionChainWebSocket.ts` | WebSocket hook |
| `components/widgets/OptionChainWidget.tsx` | UI component |
| `app/api/widgets/option-chain/route.ts` | Backend API |
| `lib/api/optionChain.ts` | API utilities |

## 🎯 Feature List

✅ Real-time WebSocket data  
✅ Greeks tracking  
✅ IV updates  
✅ Bid/Ask spreads  
✅ Volume & OI  
✅ ATM detection  
✅ Responsive UI  
✅ Loading states  
✅ Error handling  
✅ Memory optimized  

## 🔧 Customization

**Change underlying:**
```typescript
useOptionChainWebSocket('NSE', 26037)  // BANKNIFTY
```

**Change strike range:**
Edit `app/api/widgets/option-chain/route.ts` loop bounds

**Add columns:**
Edit table headers in `OptionChainWidget.tsx`

## 🧪 Testing

1. Navigate to `/widgets/option-chain`
2. Check Network tab for WebSocket
3. Verify data in table
4. Monitor console for `[useOptionChainWebSocket]` logs

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| No data | Check WebSocket in Network tab |
| Won't connect | Verify authToken in localStorage |
| Slow updates | Check network latency |
| Memory issues | Close other tabs, refresh |

## 📚 Documentation

- `OPTION_CHAIN_README.md` - Full docs
- `OPTION_CHAIN_ARCHITECTURE.md` - Architecture & diagrams
- `OPTION_CHAIN_SUMMARY.sh` - Implementation summary
- `IMPLEMENTATION_COMPLETE.md` - Status report

## 🔗 Related Files

- `/lib/exchanges.ts` - Exchange codes
- `/lib/octopus/octopusInstance.js` - WebSocket core
- `/lib/octopus/hydra-topic-config.json` - Topic config

## 📞 Support

Check browser console for detailed `[useOptionChainWebSocket]` logs if issues occur.

---

**Status:** ✅ Production Ready  
**Errors:** 0  
**Last Updated:** Nov 12, 2025

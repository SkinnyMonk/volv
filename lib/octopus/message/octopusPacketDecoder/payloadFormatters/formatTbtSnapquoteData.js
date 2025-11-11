import { getExchangeMultiplier } from '@utils/exchanges';

function formatTbtSnapquoteData({
  exchange,
  lastTradePrice,
  bidPrices,
  askPrices,
  averageTradePrice,
  open,
  high,
  low,
  close,
  ...remainingProps
}) {
  const divisor = getExchangeMultiplier(exchange);
  return {
    ...remainingProps,
    exchange,
    lastTradePrice: lastTradePrice / divisor,
    bidPrices: bidPrices.map(value => value / divisor),
    askPrices: askPrices.map(value => value / divisor),
    averageTradePrice: averageTradePrice / divisor,
    open: open / divisor,
    high: high / divisor,
    low: low / divisor,
    close: close / divisor,
  }
}

export default formatTbtSnapquoteData;

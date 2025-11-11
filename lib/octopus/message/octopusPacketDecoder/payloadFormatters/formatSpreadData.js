import { getExchangeMultiplier } from '@utils/exchanges';

function formatSpreadData({
  exchange,
  bidPrices,
  askPrices,
  open,
  high,
  low,
  close,
  ltp,
  lastTradedPrice,
  lowDpr,
  highDpr,
  closePrice,
  averageTradePrice,
  ...remainingProps
}) {
  const divisor = getExchangeMultiplier(exchange);
  const absoluteChange = open !== 0 ? (ltp - open) / divisor : 0;
  const formattedOpenPrice = open / divisor;
  const pc = (absoluteChange * 100) / (formattedOpenPrice);
  const percentChange = Number.isFinite(pc) ? pc : 0;
  return {
    bidPrices: bidPrices.map(value => value / divisor),
    askPrices: askPrices.map(value => value / divisor),
    open: open / divisor,
    high: high / divisor,
    low: low / divisor,
    close: close / divisor,
    ltp: ltp / divisor,
    lastTradedPrice: lastTradedPrice / divisor,
    lowDpr: lowDpr / divisor,
    highDpr: highDpr / divisor,
    closePrice: closePrice / divisor,
    averageTradePrice: averageTradePrice / divisor,
    absoluteChange,
    percentChange,
    ...remainingProps
  }
}

export default formatSpreadData;

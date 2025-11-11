import { getExchangeMultiplier } from '@utils/exchanges';

function formatDetailedMarketData({
  exchange,
  lastTradedPrice,
  bestBidPrice,
  bestAskPrice,
  averageTradePrice,
  openPrice,
  highPrice,
  lowPrice,
  closePrice,
  yearlyHighPrice,
  yearlyLowPrice,
  lowDPR,
  HighDPR,
  ...remainingProps
}) {
  const divisor = getExchangeMultiplier(exchange);
  

  return {
    ...remainingProps,
    exchange,
    lastTradedPrice: lastTradedPrice / divisor,
    bestBidPrice: bestBidPrice / divisor,
    bestAskPrice: bestAskPrice / divisor,
    averageTradePrice: averageTradePrice / divisor,
    openPrice: openPrice / divisor,
    highPrice: highPrice / divisor,
    lowPrice: lowPrice / divisor,
    closePrice: closePrice / divisor,
    yearlyHighPrice: yearlyHighPrice / divisor,
    yearlyLowPrice: yearlyLowPrice / divisor,
    lowDPR: lowDPR / divisor,
    HighDPR: HighDPR / divisor,
    absoluteChange: (lastTradedPrice - closePrice) / divisor,
    percentChange: ((lastTradedPrice - closePrice) * 100) / closePrice
  };
}

export default formatDetailedMarketData;

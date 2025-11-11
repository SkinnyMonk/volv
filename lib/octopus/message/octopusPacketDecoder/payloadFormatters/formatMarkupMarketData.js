import { getExchangeMultiplier } from '@utils/exchanges';

function formatMarkupMarketData({
  exchange,
  instrumentToken,
  ltt,
  ltq,
  tradeVolume,
  bidQty,
  askQty,
  indexLtp,
  indexBidPrice,
  indexAskPrice,
  markupAskPrice,
  markupLtp,
  markupBidPrice,
  exchangeTimestamp,
  openPrice,
  highPrice,
  lowPrice,
  closePrice,
  pricePrecision,
  qtyPrecision,
  fundRate,
  change,
  fundRateRes1,
  fundRateRes2,
  fundRateRes3,
}) {
  const divisor = getExchangeMultiplier(exchange);
  
  // Use pricePrecision and qtyPrecision if available, otherwise use default divisor
  const priceDiv = pricePrecision || divisor;
  const qtyDiv = qtyPrecision || divisor;

  return {
    exchange,
    instrumentToken,
    ltt,
    ltq,
    tradeVolume: tradeVolume / qtyDiv,
    bidQty: bidQty / qtyDiv,
    askQty: askQty / qtyDiv,
    indexLtp: indexLtp / priceDiv,
    indexBidPrice: indexBidPrice / priceDiv,
    indexAskPrice: indexAskPrice / priceDiv,
    markupAskPrice: markupAskPrice / priceDiv,
    markupLtp: markupLtp / priceDiv,
    markupBidPrice: markupBidPrice / priceDiv,
    exchangeTimestamp,
    openPrice: openPrice / priceDiv,
    highPrice: highPrice / priceDiv,
    lowPrice: lowPrice / priceDiv,
    closePrice: closePrice / priceDiv,
    pricePrecision,
    qtyPrecision,
    fundRate: fundRate / priceDiv,
    change,
    fundRateRes1,
    fundRateRes2,
    fundRateRes3,
  };
}

export default formatMarkupMarketData;

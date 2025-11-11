import { getExchangeMultiplier } from "@utils/exchanges";
import { stringifyNumberToIndianLocale } from "@utils";

function formatGreekData({
  exchange,
  instrumentToken,
  underlyingToken,
  exchangeTimestamp,
  delta,
  gamma,
  vega,
  rho,
  theta,
  iv,
  ltt,
  ltq,
  ltp,
  currentOpenInterest,
  initialOpenInterest,
}) {
  const divisor = getExchangeMultiplier(exchange);
  const formattedLtp = ltp / divisor;

  

  return {
    exchange,
    instrumentToken,
    underlyingToken,
    exchangeTimestamp,
    delta: Number(delta)/1000000, //: formattedGreekData(delta, "delta", instrumentToken),
    gamma: Number(gamma)/1000000, //: formattedGreekData(gamma, "gamma", instrumentToken),
    vega: Number(vega)/1000000, //: formattedGreekData(vega, "vega", instrumentToken),
    rho: Number(rho)/1000000, //: formattedGreekData(rho, "rho", instrumentToken),
    theta: Number(theta)/1000000, //: formattedGreekData(theta, "theta", instrumentToken),
    iv: Number(iv)/1000000, //: formattedGreekData(iv, "iv", instrumentToken),
    ltt,
    ltq,
    lastTradedPrice: formattedLtp,
    currentOpenInterest,
    initialOpenInterest,
  };
}

export default formatGreekData;

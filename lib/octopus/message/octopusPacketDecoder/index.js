// Binary packet decoders for different message types
import Logger from '../../logger';

DataView.prototype.getString = function (offset, length) {
  var end = typeof length == "number" ? offset + length : this.byteLength;
  var text = "";
  var val = -1;

  while (offset < this.byteLength && offset < end) {
    val = this.getUint8(offset++);
    if (val == 0) break;
    text += String.fromCharCode(val);
  }

  return text;
};

DataView.prototype.getInt64 = function (byteOffset) {
  const left = this.getUint32(byteOffset);
  const right = this.getUint32(byteOffset + 4);

  const combined = 2 ** 32 * left + right;

  if (!Number.isSafeInteger(combined)) {
    // console.warn(combined, "exceeds MAX_SAFE_INTEGER. Precision may be lost");
    return -1;
  }

  return combined;
};

// Unsigned 64-bit read helper (precision loss beyond MAX_SAFE_INTEGER)
DataView.prototype.getUint64 = function (byteOffset) {
  const left = this.getUint32(byteOffset);
  const right = this.getUint32(byteOffset + 4);
  const combined = 2 ** 32 * left + right;
  if (!Number.isSafeInteger(combined)) {
    // console.warn(combined, 'exceeds MAX_SAFE_INTEGER. Precision may be lost');
    return -1;
  }
  return combined;
};
// nNewCompactData decoder (struct size: 90 bytes)
export function compactMarketData(dataview) {
  const expectedSize = 122; // Calculated from struct: 1+1+8+8+8+8+8+8+8+8+8+8+8+4+4+8+8+8 = 122
  
  if (dataview.byteLength >= expectedSize) {
    return {
      msgType: dataview.getInt8(0),                                      // int8_t _msg_type
      exchange: dataview.getInt8(1),                                     // int8_t _exchange  
      instrumentToken: dataview.getUint64(2),                            // uint64_t _instrument_token
      ltp: dataview.getInt64(10),                                        // int64_t _ltp
      change: dataview.getInt64(18),                                     // int64_t _change
      ltt: dataview.getUint64(26),                                       // uint64_t _ltt
      lowDpr: dataview.getInt64(34),                                     // int64_t _low_dpr
      highDpr: dataview.getInt64(42),                                    // int64_t _high_dpr
      currentOpenInterest: dataview.getInt64(50),                        // int64_t _current_open_interest
      initialOpenInterest: dataview.getInt64(58),                        // int64_t _initial_open_interest
      bidPrice: dataview.getInt64(66),                                   // int64_t _bid_price
      askPrice: dataview.getInt64(74),                                   // int64_t _ask_price
      ltq: dataview.getUint64(82),                                       // uint64_t _ltq
      pricePrecision: dataview.getInt32(90),                             // int32_t _price_precision
      qtyPrecision: dataview.getInt32(94),                               // int32_t _qty_precision
      reserved1: dataview.getInt64(98),                                  // int64_t _reserved1
      reserved2: dataview.getInt64(106),                                 // int64_t _reserved2
      reserved3: dataview.getInt64(114)                                  // int64_t _reserved3
    };
  } else {
    // console.warn(`compactMarketData: Expected ${expectedSize} bytes, got ${dataview.byteLength}`);
    return {
      msgType: 0,
      exchange: 0,
      instrumentToken: 0,
      ltp: 0,
      change: 0,
      ltt: 0,
      lowDpr: 0,
      highDpr: 0,
      currentOpenInterest: 0,
      initialOpenInterest: 0,
      bidPrice: 0,
      askPrice: 0,
      ltq: 0,
      pricePrecision: 0,
      qtyPrecision: 0,
      reserved1: 0,
      reserved2: 0,
      reserved3: 0,
    };
  }
}
// nNewMarkUpMarketData decoder (struct size: 205 bytes)
export function markupMarketData(dataview) {
  const expectedSize =186; // Calculated from struct: 1+1+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+4+4+8+8+8+8+8 = 205
  
  if (dataview.byteLength >= expectedSize) {
    return {
      msgType: dataview.getInt8(0),                                      // int8_t _msg_type
      exchange: dataview.getInt8(1),                                     // int8_t _exchange
      instrumentToken: dataview.getInt64(2),                             // int64_t _instrument_token
      ltt: dataview.getInt64(10),                                        // int64_t _ltt
      ltq: dataview.getInt64(18),                                        // int64_t _ltq
      tradeVolume: dataview.getInt64(26),                                // int64_t _trade_volume
      bidQty: dataview.getInt64(34),                                     // int64_t _bid_qty
      askQty: dataview.getInt64(42),                                     // int64_t _ask_qty
      indexLtp: dataview.getInt64(50),                                   // int64_t _index_ltp
      indexBidPrice: dataview.getInt64(58),                              // int64_t _index_bid_price
      indexAskPrice: dataview.getInt64(66),                              // int64_t _index_ask_price
      markupAskPrice: dataview.getInt64(74),                             // int64_t _markup_ask_price
      markupLtp: dataview.getInt64(82),                                  // int64_t _markup_ltp
      markupBidPrice: dataview.getInt64(90),                             // int64_t _markup_bid_price
      exchangeTimestamp: dataview.getInt64(98),                          // int64_t _exchange_timestamp
      openPrice: dataview.getInt64(106),                                 // int64_t _open_price
      highPrice: dataview.getInt64(114),                                 // int64_t _high_price
      lowPrice: dataview.getInt64(122),                                  // int64_t _low_price
      closePrice: dataview.getInt64(130),                                // int64_t _close_price
      pricePrecision: dataview.getInt32(138),                            // int32_t _price_precision
      qtyPrecision: dataview.getInt32(142),                              // int32_t _qty_precision
      fundRate: dataview.getInt64(146),                                  // int64_t _fund_rate
      change: dataview.getInt64(154),                                    // int64_t _change (reserved for future use)
      fundRateRes1: dataview.getInt64(162),                              // int64_t _fund_rate_res_1 (reserved for future use)
      fundRateRes2: dataview.getInt64(170),                              // int64_t _fund_rate_res_2 (reserved for future use)
      fundRateRes3: dataview.getInt64(178)                               // int64_t _fund_rate_res_3 (reserved for future use)
    };
  } else {
    // console.warn(`markupMarketData: Expected ${expectedSize} bytes, got ${dataview.byteLength}`);
    return {
      msgType: 0,
      exchange: 0,
      instrumentToken: 0,
      ltt: 0,
      ltq: 0,
      tradeVolume: 0,
      bidQty: 0,
      askQty: 0,
      indexLtp: 0,
      indexBidPrice: 0,
      indexAskPrice: 0,
      markupAskPrice: 0,
      markupLtp: 0,
      markupBidPrice: 0,
      exchangeTimestamp: 0,
      openPrice: 0,
      highPrice: 0,
      lowPrice: 0,
      closePrice: 0,
      pricePrecision: 0,
      qtyPrecision: 0,
      fundRate: 0,
      change: 0,
      fundRateRes1: 0,
      fundRateRes2: 0,
      fundRateRes3: 0,
    };
  }
}

// nNewMarketData decoder (struct size: 218 bytes)
export function newMarketData(dataview) {
  const expectedSize = 218; // Calculated from struct: 1+1+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+8+4+4+8+8+8 = 218
  
  if (dataview.byteLength >= expectedSize) {
    return {
      msgType: dataview.getInt8(0),                                      // int8_t _msg_type
      exchange: dataview.getInt8(1),                                     // int8_t _exchange
      instrumentToken: dataview.getUint64(2),                            // uint64_t _instrument_token
      ltp: dataview.getInt64(10),                                        // int64_t _ltp
      ltt: dataview.getUint64(18),                                       // uint64_t _ltt
      ltq: dataview.getUint64(26),                                       // uint64_t _ltq
      tradeVolume: dataview.getUint64(34),                               // uint64_t _trade_volume
      bidPrice: dataview.getInt64(42),                                   // int64_t _bid_price
      bidQty: dataview.getUint64(50),                                    // uint64_t _bid_qty
      askPrice: dataview.getInt64(58),                                   // int64_t _ask_price
      askQty: dataview.getUint64(66),                                    // uint64_t _ask_qty
      totalBuyQty: dataview.getUint64(74),                               // uint64_t _total_buy_qty
      totalSellQty: dataview.getUint64(82),                              // uint64_t _total_sell_qty
      avgTradePrice: dataview.getInt64(90),                              // int64_t _avg_trade_price
      exchangeTimestamp: dataview.getUint64(98),                         // uint64_t _exchange_timestamp
      openPrice: dataview.getInt64(106),                                 // int64_t _open_price
      highPrice: dataview.getInt64(114),                                 // int64_t _high_price
      lowPrice: dataview.getInt64(122),                                  // int64_t _low_price
      closePrice: dataview.getInt64(130),                                // int64_t _close_price
      yearlyHigh: dataview.getInt64(138),                                // int64_t _yearly_high
      yearlyLow: dataview.getInt64(146),                                 // int64_t _yearly_low
      lowDpr: dataview.getInt64(154),                                    // int64_t _low_dpr
      highDpr: dataview.getInt64(162),                                   // int64_t _high_dpr
      currentOpenInterest: dataview.getInt64(170),                       // int64_t _current_open_interest
      initialOpenInterest: dataview.getInt64(178),                       // int64_t _initial_open_interest
      pricePrecision: dataview.getInt32(186),                            // int32_t _price_precision
      qtyPrecision: dataview.getInt32(190),                              // int32_t _qty_precision
      reserved1: dataview.getInt64(194),                                 // int64_t _reserved1
      reserved2: dataview.getInt64(202),                                 // int64_t _reserved2
      reserved3: dataview.getInt64(210)                                  // int64_t _reserved3
    };
  } else {
    console.warn(`newMarketData: Expected ${expectedSize} bytes, got ${dataview.byteLength}`);
    return {
      msgType: 0,
      exchange: 0,
      instrumentToken: 0,
      ltp: 0,
      ltt: 0,
      ltq: 0,
      tradeVolume: 0,
      bidPrice: 0,
      bidQty: 0,
      askPrice: 0,
      askQty: 0,
      totalBuyQty: 0,
      totalSellQty: 0,
      avgTradePrice: 0,
      exchangeTimestamp: 0,
      openPrice: 0,
      highPrice: 0,
      lowPrice: 0,
      closePrice: 0,
      yearlyHigh: 0,
      yearlyLow: 0,
      lowDpr: 0,
      highDpr: 0,
      currentOpenInterest: 0,
      initialOpenInterest: 0,
      pricePrecision: 0,
      qtyPrecision: 0,
      reserved1: 0,
      reserved2: 0,
      reserved3: 0,
    };
  }
}

// Detailed Market Data (mode 1)
export function detailedMarketData(dataview) {
  return {
    exchange: dataview.getInt8(1),
    instrumentToken: dataview.getInt32(2),
    lastTradedPrice: dataview.getInt32(6),
    lastTradedTime: dataview.getInt32(10),
    lastTradedQuantity: dataview.getInt32(14),
    volume: dataview.getInt32(18),
    bestBidPrice: dataview.getInt32(22),
    bestBidQuantity: dataview.getInt32(26),
    bestAskPrice: dataview.getInt32(30),
    bestAskQuantity: dataview.getInt32(34),
    totalBuyQuantity: dataview.getInt64(38),
    totalSellQuantity: dataview.getInt64(46),
    averageTradePrice: dataview.getInt32(54),
    exchangeTimestamp: dataview.getInt32(58),
    openPrice: dataview.getInt32(62),
    highPrice: dataview.getInt32(66),
    lowPrice: dataview.getInt32(70),
    closePrice: dataview.getInt32(74),
    yearlyHighPrice: dataview.getInt32(78),
    yearlyLowPrice: dataview.getInt32(82),
    lowDPR: dataview.getInt32(86),
    HighDPR: dataview.getInt32(90),
    currentOpenInterest: dataview.getInt32(94),
    initialOpenInterest: dataview.getInt32(98),
  };
}

// nFullSnapQuote decoder (struct size: 586 bytes)
export function snapquoteData(dataview) {
  const expectedSize = 586; // Calculated from struct: 1+1+8+80+80+80+80+80+80+8+8+8+8+8+8+8+8+4+4+8+8+8 = 578 (+8 padding)

  if (dataview.byteLength >= expectedSize) {
    try {
      // Helper function to read arrays
      const readUint64Array = (offset, count) => {
        const arr = [];
        for (let i = 0; i < count; i++) {
          arr.push(dataview.getUint64(offset + (i * 8)));
        }
        return arr;
      };

      const readInt64Array = (offset, count) => {
        const arr = [];
        for (let i = 0; i < count; i++) {
          arr.push(dataview.getInt64(offset + (i * 8)));
        }
        return arr;
      };

      return {
        msgType: dataview.getInt8(0),                                    // int8_t _msg_type
        exchange: dataview.getInt8(1),                                   // int8_t _exchange
        instrumentToken: dataview.getUint64(2),                          // uint64_t _instrument_token
        buyer: readUint64Array(10, 10),                                  // uint64_t _buyer[10]
        bidPrices: readInt64Array(90, 10),                               // int64_t _bid_prices[10]
        bidQty: readUint64Array(170, 10),                                // uint64_t _bid_qty[10]
        seller: readUint64Array(250, 10),                                // uint64_t _seller[10]
        askPrices: readInt64Array(330, 10),                              // int64_t _ask_prices[10]
        askQty: readUint64Array(410, 10),                                // uint64_t _ask_qty[10]
        avgTradePrice: dataview.getInt64(490),                           // int64_t _avg_trade_price
        open: dataview.getInt64(498),                                    // int64_t _open
        high: dataview.getInt64(506),                                    // int64_t _high
        low: dataview.getInt64(514),                                     // int64_t _low
        close: dataview.getInt64(522),                                   // int64_t _close
        totalBuyQty: dataview.getUint64(530),                            // uint64_t _total_buy_qty
        totalSellQty: dataview.getUint64(538),                           // uint64_t _total_sell_qty
        totalVolume: dataview.getUint64(546),                            // uint64_t _total_volume
        pricePrecision: dataview.getInt32(554),                          // int32_t _price_precision
        qtyPrecision: dataview.getInt32(558),                            // int32_t _qty_precision
        reserved1: dataview.getInt64(562),                               // int64_t _reserved1
        reserved2: dataview.getInt64(570),                               // int64_t _reserved2
        reserved3: dataview.getInt64(578)                                // int64_t _reserved3
      };
    } catch (error) {
      console.error('Error in snapquoteData:', error);
      return null;
    }
  } else {
    console.warn(`snapquoteData: Expected ${expectedSize} bytes, got ${dataview.byteLength}`);
    return null;
  }
}

// TBT Snapquote Data (mode 14)
export function tbtSnapquoteData(dataview) {
  try {
    const mode = dataview.getInt8(0);
    const exchange = dataview.getInt8(1);
    const token = dataview.getInt32(2, true);
    const ltp = dataview.getInt32(6, true);
    const ltq = dataview.getInt32(10, true);
    const ltt = dataview.getInt32(14, true);
    const volume = dataview.getInt32(18, true);

    // TBT specific data
    const tbtData = [];
    let offset = 22;
    const tbtCount = dataview.getInt8(offset);
    offset += 1;

    for (let i = 0; i < tbtCount && i < 20; i++) {
      tbtData.push({
        price: dataview.getInt32(offset, true),
        qty: dataview.getInt32(offset + 4, true),
        time: dataview.getInt32(offset + 8, true)
      });
      offset += 12;
    }

    return {
      mode,
      exchange,
      token,
      ltp,
      ltq,
      ltt,
      volume,
      tbtData
    };
  } catch (error) {
    Logger.error('Error decoding TBT snapquote data:', error);
    return null;
  }
}

// Spread Data (mode 5)
export function spreadData(dataview) {
  try {
    const mode = dataview.getInt8(0);
    const exchange = dataview.getInt8(1);
    const token = dataview.getInt32(2, true);
    const buyToken = dataview.getInt32(6, true);
    const sellToken = dataview.getInt32(10, true);
    const spreadValue = dataview.getInt32(14, true);
    const ltp = dataview.getInt32(18, true);
    const volume = dataview.getInt32(22, true);

    return {
      mode,
      exchange,
      token,
      buyToken,
      sellToken,
      spreadValue,
      ltp,
      volume
    };
  } catch (error) {
    Logger.error('Error decoding spread data:', error);
    return null;
  }
}

// Greek Data (mode 15)
export function greekData(dataview) {
  try {
    const mode = dataview.getInt8(0);
    const exchange= dataview.getInt8(1);
    const token= dataview.getInt32(2);
    const delta= dataview.getBigInt64(14);
    const gamma= dataview.getBigInt64(22);
    const vega= dataview.getBigInt64(30);
    const rho= dataview.getBigInt64(38);
    const theta= dataview.getBigInt64(46);
    const iv= dataview.getBigInt64(54);

  return {
    exchange,
    token,
    delta,
    gamma,
    vega,
    rho,
    theta,
    iv,
  };
}
  catch (error) {
    Logger.error('Error decoding spread data:', error);
    return null;
  }
}

// Market Status (mode 9)
export function marketStatus(dataview) {
  try {
    const mode = dataview.getInt8(0);
    const exchange = dataview.getInt8(1);
    const status = dataview.getInt8(2);
    const timestamp = dataview.getInt32(3, true);

    return {
      mode,
      exchange,
      status,
      timestamp
    };
  } catch (error) {
    Logger.error('Error decoding market status:', error);
    return null;
  }
}

// Exchange Message (mode 10)
export function exchangeMessage(dataview) {
  try {
    const mode = dataview.getInt8(0);
    const exchange = dataview.getInt8(1);
    const messageLength = dataview.getInt16(2, true);
    
    // Extract message text
    const messageBytes = new Uint8Array(dataview.buffer, 4, messageLength);
    const message = new TextDecoder().decode(messageBytes);

    return {
      mode,
      exchange,
      message
    };
  } catch (error) {
    Logger.error('Error decoding exchange message:', error);
    return null;
  }
}

// Updates (modes 11, 12, 50, 51, 58) - Order, Trade, Position updates
export function updates(dataview) {
  const stringifiedUpdate = dataview.getString(5) || "{}";
  return JSON.parse(stringifiedUpdate);
}
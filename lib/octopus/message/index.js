import Logger from '../logger';
import {
  compactMarketData,
  snapquoteData,
  markupMarketData,
  marketStatus,
  exchangeMessage,
  updates,
  detailedMarketData,
  tbtSnapquoteData,
  spreadData,
  greekData
} from './octopusPacketDecoder';
import {
  formatCompactMarketData,
  formatSnapquoteData,
  formatDetailedMarketData,
  formatTbtSnapquoteData,
  formatSpreadData,
  formatGreekData,
  formatMarkupMarketData
} from './octopusPacketDecoder/payloadFormatters';

export function decodeMessage(buffer) {
  const dataview = new DataView(buffer);
  const mode = dataview.getInt8(0);

  let msg = {};
  let topic = '';
  
  switch (mode) {

    case 15:  // marketdata
      msg = greekData(dataview) || {};
      topic = `GreekData/${msg.exchange}/${msg.token}`;
      return { topic, msg: formatGreekData(msg) };

    case 1:  // marketdata
      msg = detailedMarketData(dataview) || {};
      topic = `DetailMarketDataMessage/${msg.exchange}/${msg.instrumentToken}`;
      return { topic, msg: formatDetailedMarketData(msg) };

    case 2:  // compact_marketdata
      msg = compactMarketData(dataview) || {};
      topic = `CompactMarketDataMessage/${msg.exchange}/${msg.instrumentToken}`;
      return { topic, msg: formatCompactMarketData(msg) };
    
    case 3:  // auction_marketdata
      msg = compactMarketData(dataview) || {};
      topic = `AuctionMarketDataMessage/${msg.exchange}/${msg.instrumentToken}`;
      return { topic, msg: formatCompactMarketData(msg) };

    case 4:  // full snapquote
      msg = snapquoteData(dataview) || {};
      topic = `SnapquoteDataMessage/${msg.exchange}/${msg.instrumentToken}`;
      return { topic, msg: formatSnapquoteData(msg) };

    case 5: //  spreaddata
      msg = spreadData(dataview) || {};
      topic = `SpreadMarketUpdate/${msg.exchange}/${msg.instrumentToken1}-${msg.instrumentToken2}`;
      return { topic, msg: formatSpreadData(msg) };

    case 9:  // market status
      msg = marketStatus(dataview) || {};
      topic = `MktStatus/${msg.exchange}`;
      return { topic, msg };

    case 10:  // exchange_messages
      msg = exchangeMessage(dataview) || {};
      topic = `ExchangeMessage/${msg.exchange}`;
      return { topic, msg };
    case 11:   // order update for TR
      msg = updates(dataview) || {};
      topic = 'OrderUpdate';
      return { topic, msg };
    case 12:   // trade update for TR
      msg = updates(dataview) || {};
      topic = 'TradeUpdate';
      return { topic, msg };
    case 14: // tbt_full_snapquote
      msg = tbtSnapquoteData(dataview) || {};
      topic = `TbtSnapquoteDataMessage/${msg.exchange}/${msg.instrumentToken}`;
      return { topic, msg: formatTbtSnapquoteData(msg) };

    case 50:  // order update
      msg = updates(dataview) || {};
      topic = 'OrderUpdate';
      return { topic, msg };

    case 51:  // trade update
      msg = updates(dataview) || {};
      topic = 'TradeUpdate';
      return { topic, msg };
    case 58: // position update
      msg = updates(dataview) || {};
      topic = 'PositionUpdate';
      return { topic, msg };  
    case 56: // funds update
      msg = updates(dataview) || {};
      topic = 'FundsUpdate';
      return { topic, msg };
    case 20: // markup_marketdata
      msg = markupMarketData(dataview) || {};
      topic = `MarkupMarketData/${msg.exchange}/${msg.instrumentToken}`;
      return { topic, msg: formatMarkupMarketData(msg) };
    default:
      return {};
  }
} 
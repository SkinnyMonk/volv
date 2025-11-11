import { apiV1 } from '@/lib/axios';

export interface TradeData {
  tags: string | null;
  instrument_token: number;
  symbol: string;
  broker_id: string;
  trigger_price: number | null;
  disclosed_vol_remaining: number;
  trading_symbol: string;
  display_symbol: string;
  good_till_date: number;
  order_type: 'MARKET' | 'LIMIT' | 'SLM' | string;
  order_entry_time: number;
  pro_cli: number;
  pan: string;
  vol_filled_today: number;
  login_id: string;
  order_price: number;
  series: string;
  order_side: 'BUY' | 'SELL';
  fill_number: string | null;
  exchange_time: number;
  trade_number: string;
  source: string;
  remaining_quantity: number;
  book_type: string;
  filled_quantity: number;
  trade_quantity: number;
  category: string;
  trade_price: number;
  client_id: string;
  product: 'CNC' | 'MIS' | 'BO' | 'CO' | string;
  exchange: 'NSE' | 'BSE' | 'NFO' | 'MCX' | 'BFO' | string;
  v_login_id: string | null;
  original_vol: number;
  disclosed_vol: number;
  oms_order_id: string;
  exchange_order_id: string;
  price_precision: number;
  trade_time: number;
}

export interface TradesResponse {
  data: {
    trades: TradeData[];
  };
  message: string;
  status: string;
}

/**
 * Fetch trades from the broker API
 * @param clientId - Client ID
 * @returns Trades data
 */
export async function fetchTrades(clientId: string): Promise<TradeData[]> {
  try {
    const response = await apiV1.get<TradesResponse>('/trades', {
      params: {
        client_id: clientId,
      },
    });

    if (response.data.status === 'success' && response.data.data?.trades) {
      return response.data.data.trades;
    }
    return [];
  } catch (error) {
    console.error('[fetchTrades] Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.error('[fetchTrades] Authentication failed. Token may be expired.');
      }
    }
    return [];
  }
}

/**
 * Transform trade data for display
 */
export function transformTradeForDisplay(trade: TradeData) {
  return {
    id: trade.trade_number,
    symbol: trade.display_symbol || trade.trading_symbol,
    tradingSymbol: trade.trading_symbol,
    type: trade.order_side as 'BUY' | 'SELL',
    quantity: trade.trade_quantity,
    price: trade.trade_price,
    orderPrice: trade.order_price,
    time: new Date(trade.trade_time * 1000).toLocaleTimeString(),
    timestamp: trade.trade_time,
    exchange: trade.exchange,
    product: trade.product,
    orderType: trade.order_type,
    omsOrderId: trade.oms_order_id,
    exchangeOrderId: trade.exchange_order_id,
    pan: trade.pan,
  };
}

export type DisplayTrade = ReturnType<typeof transformTradeForDisplay>;

import { apiV1 } from '@/lib/axios';

export interface OptionChainRow {
  strike: number;
  callBid: number;
  callAsk: number;
  callVolume: number;
  callOpenInterest: number;
  putBid: number;
  putAsk: number;
  putVolume: number;
  putOpenInterest: number;
}

export interface OptionChainData {
  underlying: {
    symbol: string;
    ltp: number;
    token: number;
  };
  expiry: string;
  rows: OptionChainRow[];
  timestamp: string;
}

export interface QuoteData {
  ltp: number;
  [key: string]: string | number | boolean | null;
}

/**
 * Fetch current market price for Nifty 50
 */
export async function fetchNifty50Price(): Promise<number> {
  try {
    const response = await apiV1.get<{
      data: QuoteData[];
    }>('/quote/', {
      params: {
        mode: 'LTP',
        exch_tsym: '1:NIFTY 50-INDEX',
      },
    });

    const niftyData = response.data.data?.[0];
    if (niftyData) {
      return niftyData.ltp;
    }
    return 24500; // fallback
  } catch (error) {
    console.error('[fetchNifty50Price] Error:', error);
    return 24500; // fallback price
  }
}

/**
 * Fetch option chain data for Nifty 50
 * NSE = 1, Instrument Token = 26000
 */
export async function fetchOptionChainData(): Promise<OptionChainData> {
  try {
    const niftyPrice = await fetchNifty50Price();

    // Fetch option chain data from broker API
    const response = await apiV1.get<{
      data: Array<{
        strikePrice: number;
        callBidPrice: number;
        callAskPrice: number;
        callVolume: number;
        callOpenInterest: number;
        putBidPrice: number;
        putAskPrice: number;
        putVolume: number;
        putOpenInterest: number;
        expiryDate: string;
      }>;
    }>('/optionchain/', {
      params: {
        exch: '1', // NSE
        token: '26000', // Nifty 50 instrument token
      },
    });

    interface ApiOptionChainRow {
      strikePrice?: number;
      strike_price?: number;
      callBidPrice?: number;
      call_bid_price?: number;
      callAskPrice?: number;
      call_ask_price?: number;
      callVolume?: number;
      call_volume?: number;
      callOpenInterest?: number;
      call_oi?: number;
      putBidPrice?: number;
      put_bid_price?: number;
      putAskPrice?: number;
      put_ask_price?: number;
      putVolume?: number;
      put_volume?: number;
      putOpenInterest?: number;
      put_oi?: number;
    }

    const optionChainRows: OptionChainRow[] = (response.data.data || []).map(
      (row: ApiOptionChainRow) => ({
        strike: row.strikePrice || row.strike_price || 0,
        callBid: row.callBidPrice || row.call_bid_price || 0,
        callAsk: row.callAskPrice || row.call_ask_price || 0,
        callVolume: row.callVolume || row.call_volume || 0,
        callOpenInterest: row.callOpenInterest || row.call_oi || 0,
        putBid: row.putBidPrice || row.put_bid_price || 0,
        putAsk: row.putAskPrice || row.put_ask_price || 0,
        putVolume: row.putVolume || row.put_volume || 0,
        putOpenInterest: row.putOpenInterest || row.put_oi || 0,
      })
    );

    return {
      underlying: {
        symbol: 'NIFTY 50',
        ltp: niftyPrice,
        token: 26000,
      },
      expiry: optionChainRows[0]?.strike ? new Date().toISOString().split('T')[0] : 'N/A',
      rows: optionChainRows.sort((a, b) => a.strike - b.strike),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[fetchOptionChainData] Error:', error);
    throw error;
  }
}

/**
 * Generate mock option chain data for development/fallback
 */
export function generateMockOptionChain(underlyingPrice: number): OptionChainRow[] {
  const data: OptionChainRow[] = [];
  const baseStrike = Math.round(underlyingPrice / 100) * 100;

  for (let i = -10; i <= 10; i++) {
    const strike = baseStrike + i * 100;

    data.push({
      strike,
      callBid: Math.max(0.01, (underlyingPrice - strike) * 0.5 + Math.random() * 10),
      callAsk: Math.max(0.01, (underlyingPrice - strike) * 0.5 + Math.random() * 10 + 5),
      callVolume: Math.floor(Math.random() * 15000) + 500,
      callOpenInterest: Math.floor(Math.random() * 50000) + 5000,
      putBid: Math.max(0.01, (strike - underlyingPrice) * 0.5 + Math.random() * 10),
      putAsk: Math.max(0.01, (strike - underlyingPrice) * 0.5 + Math.random() * 10 + 5),
      putVolume: Math.floor(Math.random() * 15000) + 500,
      putOpenInterest: Math.floor(Math.random() * 50000) + 5000,
    });
  }

  return data;
}

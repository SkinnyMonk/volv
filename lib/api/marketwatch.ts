import { apiV3 } from '@/lib/axios';

export interface Instrument {
  id: string;
  index: boolean;
  exchange: string;
  description: string;
  token: string | number;
  trading_symbol: string;
  display_name: string;
  short_name: string;
  expiry: string;
  execution: string;
  instrument_name: string;
  have_futures: boolean;
  have_options: boolean;
  tradable: boolean;
  lotsize: number;
}

export interface MarketWatch {
  id: string;
  name: string;
  login_id: string;
  instruments: Instrument[];
}

export interface MarketWatchesResponse {
  data: MarketWatch[];
  message: string;
  status: string;
}

export async function fetchMarketWatches(clientId: string): Promise<MarketWatchesResponse> {
  try {
    console.log(`[fetchMarketWatches] Calling API v3 /marketwatches for client: ${clientId}`);
    const response = await apiV3.get<MarketWatchesResponse>('/marketwatches');

    console.log(`[fetchMarketWatches] Response status: ${response.status}, count: ${response.data.data?.length || 0}`);
    return response.data;
  } catch (error) {
    console.error('[fetchMarketWatches] API error:', error);
    throw error;
  }
}

export async function getDefaultMarketWatch(clientId: string): Promise<MarketWatch | null> {
  try {
    const response = await fetchMarketWatches(clientId);
    // Return first market watch (or first one with instruments)
    const watchWithInstruments = response.data.find((watch) => watch.instruments.length > 0);
    return watchWithInstruments || response.data[0] || null;
  } catch (error) {
    console.error('[getDefaultMarketWatch] Error:', error);
    throw error;
  }
}

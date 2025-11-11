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

export async function fetchMarketWatches(): Promise<MarketWatchesResponse> {
  try {
    const response = await apiV3.get<MarketWatchesResponse>('/marketwatches');
    return response.data;
  } catch {
    throw Error('Failed to fetch market watches');
  }
}

export async function getDefaultMarketWatch(): Promise<MarketWatch | null> {
  try {
    const response = await fetchMarketWatches();
    // Return first market watch (or first one with instruments)
    const watchWithInstruments = response.data.find((watch) => watch.instruments.length > 0);
    return watchWithInstruments || response.data[0] || null;
  } catch {
    throw Error('Failed to get default market watch');
  }
}

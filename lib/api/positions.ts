import { apiV1 } from '@/lib/axios';

// Backend API response position object
export interface ApiPosition {
  symbol: string;
  trading_symbol: string;
  display_symbol: string;
  ltp: number;
  buy_quantity: number;
  sell_quantity: number;
  net_quantity: number;
  average_buy_price: number;
  average_sell_price: number;
  net_amount: number;
  exchange: string;
  product: string;
  [key: string]: unknown;
}

export interface Position {
  symbol: string;
  trading_symbol: string;
  ltp: number;
  buy_quantity: number;
  sell_quantity: number;
  net_quantity: number;
  average_buy_price: number;
  current_value: number;
  pnl: number;
  pnl_percentage: number;
  exchange: string;
  product: string;
  [key: string]: unknown;
}

export interface PositionsResponse {
  data: Position[];
  message: string;
  status: string;
}

export interface ApiPositionsResponse {
  data: ApiPosition[];
  message: string;
  status: string;
}

// Normalize API response to our Position interface
function normalizePosition(apiPosition: ApiPosition): Position {
  const netQty = apiPosition.net_quantity || 0;
  const ltp = apiPosition.ltp || 0;
  const currentValue = Math.abs(ltp * netQty);
  const pnl = apiPosition.net_amount || 0;
  
  // Calculate P&L percentage
  let pnlPercentage = 0;
  if (currentValue > 0) {
    pnlPercentage = (pnl / currentValue) * 100;
  }

  return {
    symbol: apiPosition.symbol || '',
    trading_symbol: apiPosition.trading_symbol || '',
    ltp: ltp,
    buy_quantity: apiPosition.buy_quantity || 0,
    sell_quantity: apiPosition.sell_quantity || 0,
    net_quantity: netQty,
    average_buy_price: apiPosition.average_buy_price || 0,
    current_value: currentValue,
    pnl: pnl,
    pnl_percentage: pnlPercentage,
    exchange: apiPosition.exchange || '',
    product: apiPosition.product || '',
  };
}

export async function fetchPositions(
  clientId: string
): Promise<PositionsResponse> {
  try {
    console.log(`[fetchPositions] Calling API v1 /positions with params:`, { clientId, type: 'historical' });
    const response = await apiV1.get<ApiPositionsResponse>('/positions', {
      params: {
        client_id: clientId,
        type: 'historical',
      },
    });

    console.log(`[fetchPositions] API response status: ${response.status}, data count: ${response.data.data?.length || 0}`);
    
    // Normalize the response data
    const normalizedData = response.data.data.map(normalizePosition);
    
    return {
      data: normalizedData,
      message: response.data.message,
      status: response.data.status,
    };
  } catch (error) {
    console.error('[fetchPositions] API error:', error);
    throw error;
  }
}

export async function getPositionsSummary(clientId: string) {
  try {
    const response = await fetchPositions(clientId);
    
    if (response.data && Array.isArray(response.data)) {
      const totalValue = response.data.reduce((sum, pos) => sum + (pos.current_value || 0), 0);
      const totalPnL = response.data.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
      const totalPnLPercentage = response.data.length > 0 && totalValue > 0
        ? (totalPnL / totalValue) * 100 
        : 0;

      return {
        totalPositions: response.data.length,
        totalValue,
        totalPnL,
        totalPnLPercentage,
        positions: response.data,
      };
    }

    return {
      totalPositions: 0,
      totalValue: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      positions: [],
    };
  } catch (error) {
    console.error('Failed to get positions summary:', error);
    throw error;
  }
}

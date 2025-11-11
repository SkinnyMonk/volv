import { apiV1 } from '@/lib/axios';

export interface OrderData {
  no_of_legs: number | null;
  tags: string | null;
  sl_order_quantity: number;
  instrument_token: number;
  symbol: string;
  gtt_target_price: number;
  leg_order_indicator: string | null;
  market_protection_percentage: number;
  segment: string;
  disclosed_quantity: number;
  is_trailing: boolean;
  broker_id: string;
  trigger_price: number;
  price: number;
  nnf_id: number;
  trading_symbol: string;
  display_symbol: string;
  device: string;
  gtt_price: string;
  average_trade_price: number;
  order_type: 'MARKET' | 'LIMIT' | 'SLM' | string;
  average_price: number;
  order_entry_time: number;
  pro_cli: 'CLIENT' | 'PRO' | string;
  order_status:
    | 'COMPLETE'
    | 'REJECTED'
    | 'PENDING'
    | 'CANCEL_CONFIRMED'
    | 'AMO_CANCEL_CONFIRMED'
    | string;
  order_tag: string;
  quantity: number;
  target_price_type: string;
  login_id: string;
  is_gtt: boolean;
  execution_type: 'REGULAR' | 'BO' | 'CO' | 'AMO' | string;
  square_off: boolean;
  validity: 'DAY' | 'IOC' | string;
  series: string;
  rejection_reason: string;
  order_side: 'BUY' | 'SELL';
  exchange_time: number;
  source: string;
  total_qty: number;
  spread_token: string | null;
  rejection_code: number;
  remaining_quantity: number;
  user_order_id: string;
  square_off_value: number;
  underlying_token: string | null;
  order_status_info: string;
  filled_quantity: number;
  gtt_sl_price: number;
  mode: 'NEW' | string;
  category: string;
  trade_price: number;
  client_id: string;
  product: 'CNC' | 'MIS' | 'BO' | 'CO' | string;
  exchange: 'NSE' | 'BSE' | 'NFO' | 'MCX' | 'BFO' | string;
  lot_size: number;
  trailing_stop_loss: number;
  stop_loss_value: number;
  oms_order_id: string;
  exchange_order_id: string;
  sl_trigger_price: number;
  isin: string;
  contract_description: Record<string, unknown>;
  deposit: number;
  last_activity_reference: number;
  sl_order_price: number;
  price_precision: number;
}

export interface OrdersResponse {
  data: {
    orders: OrderData[];
  };
  message: string;
  status: string;
}

export type OrderStatus = 'completed' | 'pending' | 'all';

/**
 * Fetch orders from the broker API
 * @param type - Order type: 'completed', 'pending', or 'all'
 * @param clientId - Client ID
 * @returns Orders data
 */
export async function fetchOrders(
  type: OrderStatus = 'completed',
  clientId: string
): Promise<OrderData[]> {
  try {
    // Ensure auth token is available
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.warn('[fetchOrders] No auth token found. User may not be authenticated.');
    }

    const response = await apiV1.get<OrdersResponse>('/orders', {
      params: {
        type,
        client_id: clientId,
      },
    });

    if (response.data.status === 'success' && response.data.data?.orders) {
      return response.data.data.orders;
    }
    return [];
  } catch (error) {
    console.error('[fetchOrders] Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.error('[fetchOrders] Authentication failed. Token may be expired.');
      } else if (error.message.includes('403')) {
        console.error('[fetchOrders] Permission denied.');
      } else if (error.message.includes('404')) {
        console.error('[fetchOrders] Orders endpoint not found.');
      }
    }
    return [];
  }
}

/**
 * Fetch completed orders
 */
export async function fetchCompletedOrders(clientId: string): Promise<OrderData[]> {
  return fetchOrders('completed', clientId);
}

/**
 * Fetch pending orders
 */
export async function fetchPendingOrders(clientId: string): Promise<OrderData[]> {
  return fetchOrders('pending', clientId);
}

/**
 * Transform order data for display
 */
export function transformOrderForDisplay(order: OrderData) {
  return {
    id: order.oms_order_id,
    nnfId: order.nnf_id,
    symbol: order.display_symbol || order.trading_symbol,
    tradingSymbol: order.trading_symbol,
    type: order.order_side as 'BUY' | 'SELL',
    quantity: order.quantity,
    filledQuantity: order.filled_quantity,
    remainingQuantity: order.remaining_quantity,
    price: order.price,
    averagePrice: order.average_price || order.average_trade_price,
    orderType: order.order_type,
    status: order.order_status,
    exchange: order.exchange,
    product: order.product,
    time: new Date(order.order_entry_time * 1000).toLocaleTimeString(),
    timestamp: order.order_entry_time,
    rejectionReason: order.rejection_reason,
    triggerPrice: order.trigger_price,
    validity: order.validity,
    executionType: order.execution_type,
    device: order.device,
  };
}

/**
 * Get status badge info
 */
export function getOrderStatusInfo(status: string) {
  const statusMap: Record<
    string,
    { label: string; color: string; icon: string }
  > = {
    COMPLETE: { label: 'Completed', color: 'bg-green-900', icon: '✓' },
    FILLED: { label: 'Filled', color: 'bg-green-900', icon: '✓' },
    PENDING: { label: 'Pending', color: 'bg-yellow-900', icon: '⏱' },
    REJECTED: { label: 'Rejected', color: 'bg-red-900', icon: '✕' },
    CANCEL_CONFIRMED: {
      label: 'Cancelled',
      color: 'bg-red-900',
      icon: '✕',
    },
    AMO_CANCEL_CONFIRMED: {
      label: 'AMO Cancelled',
      color: 'bg-red-900',
      icon: '✕',
    },
  };

  return (
    statusMap[status] || { label: status, color: 'bg-gray-900', icon: '?' }
  );
}

/**
 * Filter orders by status
 */
export function filterOrdersByStatus(
  orders: OrderData[],
  status: 'completed' | 'pending' | 'all'
) {
  if (status === 'all') return orders;

  if (status === 'completed') {
    return orders.filter((o) =>
      ['COMPLETE', 'FILLED', 'REJECTED', 'CANCEL_CONFIRMED'].includes(
        o.order_status
      )
    );
  }

  if (status === 'pending') {
    return orders.filter(
      (o) =>
        !['COMPLETE', 'FILLED', 'REJECTED', 'CANCEL_CONFIRMED'].includes(
          o.order_status
        )
    );
  }

  return orders;
}

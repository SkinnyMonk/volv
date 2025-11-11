/**
 * Exchange configuration mapping
 */
export const EXCHANGE_CONFIG = [
  { name: 'NSE', code: 1, multiplier: 100 },
  { name: 'NFO', code: 2, multiplier: 100 },
  { name: 'CDS', code: 3, multiplier: 10000000 },
  { name: 'MCX', code: 4, multiplier: 100 },
  { name: 'MCXSX', code: 5, multiplier: 100 },
  { name: 'BSE', code: 6, multiplier: 100 },
  { name: 'BFO', code: 7, multiplier: 100 },
  { name: 'BCD', code: 8, multiplier: 10000000 },
  { name: 'NSE_INDICES', code: 9, multiplier: 100 },
  { name: 'NCDEX', code: 10, multiplier: 100 },
  { name: 'NCO', code: 11, multiplier: 100 },
  { name: 'NSLBM', code: 12, multiplier: 100 },
  { name: 'NOFS', code: 13, multiplier: 100 },
  { name: 'DSE', code: 14, multiplier: 100 },
  { name: 'BSLBM', code: 15, multiplier: 100 },
  { name: 'NCOM', code: 11, multiplier: 100 },
];

/**
 * Get exchange configuration by name
 * @param exchangeName - The exchange name (e.g., 'NSE', 'BSE', 'MCX')
 * @returns Exchange configuration object or undefined
 */
export function getExchangeConfig(exchangeName: string | number) {
  const name = String(exchangeName).toUpperCase().trim();
  return EXCHANGE_CONFIG.find((config) => config.name === name || config.code === parseInt(name));
}

/**
 * Get the numeric code for a specific exchange
 * @param exchange - The exchange name or code
 * @returns The numeric code for the exchange
 */
export function getExchangeCode(exchange: string | number): number {
  const config = getExchangeConfig(exchange);
  return config?.code || 1; // Default to NSE (1)
}

/**
 * Get the divisor/multiplier for a specific exchange
 * Used to normalize market data prices across different exchanges
 * @param exchange - The exchange code (NSE, BSE, MCX, etc.)
 * @returns The divisor for the exchange
 */
export function getExchangeMultiplier(exchange: string | number): number {
  const config = getExchangeConfig(exchange);
  return config?.multiplier || 100; // Default to 100
}

/**
 * Normalize price based on exchange divisor
 * @param price - Raw price value from exchange
 * @param exchange - The exchange code or name
 * @returns Normalized price
 */
export function normalizePrice(price: number, exchange: string | number): number {
  const divisor = getExchangeMultiplier(exchange);
  return price / divisor;
}

/**
 * Get exchange name from exchange code or name
 * @param exchange - Exchange code or name
 * @returns Full exchange name
 */
export function getExchangeName(exchange: string | number): string {
  const config = getExchangeConfig(exchange);
  return config?.name || 'NSE';
}

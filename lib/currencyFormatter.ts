/**
 * Format a number as Indian Rupees (INR)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with ₹ symbol
 */
export const formatINR = (amount: number, decimals: number = 2): string => {
  return `₹${amount.toFixed(decimals)}`;
};

/**
 * Format a large number with Indian numbering system (10L, 1Cr, etc.)
 * @param amount - The amount to format
 * @returns Formatted string in Indian format
 */
export const formatIndianNumber = (amount: number): string => {
  if (amount >= 10000000) {
    return (amount / 10000000).toFixed(2) + ' Cr';
  } else if (amount >= 100000) {
    return (amount / 100000).toFixed(2) + ' L';
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(2) + 'K';
  }
  return amount.toFixed(0);
};

/**
 * Indian stock symbols
 */
export const INDIAN_STOCKS = {
  TCS: { name: 'Tata Consultancy Services', sector: 'IT' },
  INFY: { name: 'Infosys', sector: 'IT' },
  WIPRO: { name: 'Wipro', sector: 'IT' },
  RELIANCE: { name: 'Reliance Industries', sector: 'Energy' },
  HDFC: { name: 'HDFC Bank', sector: 'Banking' },
  ICICIBANK: { name: 'ICICI Bank', sector: 'Banking' },
  SBIN: { name: 'State Bank of India', sector: 'Banking' },
  MARUTI: { name: 'Maruti Suzuki', sector: 'Automotive' },
  BAJAJ: { name: 'Bajaj Auto', sector: 'Automotive' },
  COALINDIA: { name: 'Coal India', sector: 'Energy' },
  LT: { name: 'Larsen & Toubro', sector: 'Infrastructure' },
  ITC: { name: 'ITC', sector: 'FMCG' },
  NESTLEIND: { name: 'Nestle India', sector: 'FMCG' },
  UNILEVER: { name: 'Unilever India', sector: 'FMCG' },
  ASIANPAINT: { name: 'Asian Paints', sector: 'Chemicals' },
} as const;

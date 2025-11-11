/**
 * Convert a number to a fixed decimal precision
 * @param number - The number to convert
 * @param precision - Number of decimal places (default: 0)
 * @returns Fixed decimal string
 */
export function toDecimal(number: number, precision = 0): string {
  return Number.parseFloat(Number(number).toString()).toFixed(precision);
}

/**
 * Compare a date string (DD-MM-YYYY format) with today's date
 * @param compareDate - Date string in DD-MM-YYYY format
 * @returns "greater" if today is after the date, "equal" if same day, "smaller" if today is before the date
 */
export const dateCompare = (compareDate: string): 'greater' | 'equal' | 'smaller' => {
  const today = new Date();
  const date = compareDate.split('-');
  const anotherDate = new Date(Number(date[2]), Number(date[1]) - 1, Number(date[0]));

  today.setHours(0, 0, 0, 0);
  anotherDate.setHours(0, 0, 0, 0);

  if (today > anotherDate) {
    return 'greater';
  } else if (today.getTime() === anotherDate.getTime()) {
    return 'equal';
  } else {
    return 'smaller';
  }
};

/**
 * Format a number to Indian locale string with specified precision
 * @param number - The number to format (default: 0)
 * @param precision - Number of decimal places (default: 0)
 * @returns Formatted string in Indian locale (e.g., "1,00,000.00")
 */
export function stringifyNumberToIndianLocale(number = 0, precision = 0): string {
  return Number(toDecimal(number, precision)).toLocaleString('en-IN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

/**
 * Convert large numbers to abbreviated format (Cr., Lac., k.)
 * @param value - The number to differentiate
 * @returns Abbreviated string (e.g., "1.50 Cr.", "2.30 Lac.", "5.00 k.")
 */
export function numDifferentiation(value: number): string {
  const val = Math.abs(value);

  if (val >= 10000000) {
    return (val / 10000000).toFixed(2) + ' Cr.';
  } else if (val >= 100000) {
    return (val / 100000).toFixed(2) + ' Lac.';
  } else if (val >= 10000) {
    return (val / 10000).toFixed(2) + ' k.';
  }
  return String(val);
}

/**
 * Compare a timestamp (in seconds) with today's date
 * @param closeDate - Unix timestamp in seconds
 * @returns "greater" if today is after the date, "smaller" if today is before the date
 */
export const numberOfDays = (closeDate: number): 'greater' | 'smaller' => {
  const today = new Date();
  const nfoDate = new Date(closeDate * 1000);
  
  if (today > nfoDate) {
    return 'greater';
  } else {
    return 'smaller';
  }
};

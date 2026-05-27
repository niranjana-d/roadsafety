/**
 * Currency formatting utility
 */

/**
 * Format a number as Indian Rupees (₹)
 */
export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/**
 * Format currency based on country code
 */
export function formatCurrency(amount: number, countryCode: string = 'IN'): string {
  const config: Record<string, { symbol: string; locale: string }> = {
    IN: { symbol: '₹', locale: 'en-IN' },
    US: { symbol: '$', locale: 'en-US' },
    GB: { symbol: '£', locale: 'en-GB' },
  };
  const c = config[countryCode] || config.IN;
  return c.symbol + amount.toLocaleString(c.locale);
}

/**
 * Parse a formatted currency string back to number
 */
export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, '')) || 0;
}

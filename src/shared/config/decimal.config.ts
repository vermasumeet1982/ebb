import { Decimal } from 'decimal.js';

/**
 * Configure Decimal.js for financial calculations
 * Configured for banking precision requirements:
 * - High precision for accurate calculations (20 significant digits)
 * - Standard rounding for financial operations
 * - Two decimal places enforced via toFixed(2) when needed
 */
export function configureDecimal(): void {
  Decimal.set({
    precision: 20, // High precision for accurate financial calculations
    rounding: Decimal.ROUND_HALF_UP, // Standard rounding for banking
    defaults: true, // Ensure consistent behavior across the app
  });
} 
import { Decimal } from 'decimal.js';

/**
 * Configure Decimal.js for financial calculations
 * Configured to match OpenAPI spec requirements:
 * - Two decimal places (e.g., 1000.00)
 * - Format: double
 */
export function configureDecimal(): void {
  Decimal.set({
    precision: 2, // Two decimal places as per spec
    rounding: Decimal.ROUND_HALF_UP, // Standard rounding
    defaults: true, // Ensure consistent behavior across the app
  });
} 
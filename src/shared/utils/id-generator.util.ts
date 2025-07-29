import { randomBytes } from 'crypto';

/**
 * Generates a unique user ID with 'usr-' prefix
 * Pattern: usr-[A-Za-z0-9]+ (using hex characters for simplicity)
 */
export function generateUserId(): string {
  const suffix = randomBytes(8).toString('hex'); // 16 character hex string
  return `usr-${suffix}`;
}

/**
 * Generates a transaction ID with pattern: tan-[A-Za-z0-9]+
 * Note: This generates a longer ID than the OpenAPI spec pattern (^tan-[A-Za-z0-9]$)
 * for better uniqueness and security in a banking context
 */
export function generateTransactionId(): string {
  const suffix = randomBytes(8).toString('hex'); // 16 character hex string
  return `tan-${suffix}`;
}

/**
 * Generates an account number with pattern: 01xxxxxx (8 digits starting with 01)
 * Returns a number between 01000000 and 01999999
 */
export function generateAccountNumber(): string {
  // Generate a random number between 0 and 999999
  const randomNum = Math.floor(Math.random() * 1000000);
  // Convert to string and pad with leading zeros to ensure 6 digits
  const sixDigits = randomNum.toString().padStart(6, '0');
  // Prefix with '01' to match the required pattern
  return `01${sixDigits}`;
}
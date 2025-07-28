import { randomBytes } from 'crypto';

/**
 * Generates a user ID with pattern: usr-[A-Za-z0-9]+
 */
export function generateUserId(): string {
  const suffix = randomBytes(8).toString('hex'); // 16 character hex string
  return `usr-${suffix}`;
}

/**
 * Generates a transaction ID with pattern: tan-[A-Za-z0-9]+
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

/**
 * Validates if a string matches the user ID pattern
 */
export function isValidUserId(id: string): boolean {
  return /^usr-[A-Za-z0-9]+$/.test(id);
}

/**
 * Validates if a string matches the transaction ID pattern
 */
export function isValidTransactionId(id: string): boolean {
  return /^tan-[A-Za-z0-9]+$/.test(id);
}

/**
 * Validates if a string matches the account number pattern
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  return /^01\d{6}$/.test(accountNumber);
}

/**
 * Validates if a string matches the phone number pattern
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
} 
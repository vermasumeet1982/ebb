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
 */
export function generateAccountNumber(): string {
  const suffix = Math.floor(100000 + Math.random() * 900000); // 6 digit number
  return `01${suffix}`;
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
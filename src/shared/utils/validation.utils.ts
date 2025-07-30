/**
 * Validates if a string matches the user ID pattern
 * Format: usr-[A-Za-z0-9]+ (letters and numbers, case sensitive)
 */
export function isValidUserId(id: string): boolean {
  return /^usr-[A-Za-z0-9]+$/.test(id);
}

/**
 * Validates if a string matches the transaction ID pattern
 * Format: tan-[A-Za-z0-9]+ (letters and numbers, case sensitive)
 * Note: This is more permissive than the OpenAPI spec pattern (^tan-[A-Za-z0-9]$)
 * to support longer, more secure transaction IDs
 */
export function isValidTransactionId(id: string): boolean {
  return /^tan-[A-Za-z0-9]+$/.test(id);
}

/**
 * Validates if a string matches the account number pattern
 * Format: 01XXXXXX where X is a digit (8 digits total, starting with 01)
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  return /^01\d{6}$/.test(accountNumber);
}

/**
 * Validates if a string matches the phone number pattern
 * Format: +X... where X is 1-9 and total length is 2-15 digits
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
} 
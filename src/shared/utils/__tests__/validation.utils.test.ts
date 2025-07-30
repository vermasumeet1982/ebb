import {
  isValidUserId,
  isValidTransactionId,
  isValidAccountNumber,
  isValidPhoneNumber,
} from '../validation.utils';

describe('Validation Utils', () => {
  describe('isValidUserId', () => {
    it('should validate correct user IDs', () => {
      const validIds = [
        'usr-123',
        'usr-abc',
        'usr-ABC',
        'usr-123ABC',
        'usr-abcDEF123456',
        'usr-a1B2c3',
      ];

      validIds.forEach(id => {
        expect(isValidUserId(id)).toBe(true);
      });
    });

    it('should reject invalid user IDs', () => {
      const invalidIds = [
        'user-123', // Wrong prefix
        'usr_123', // Invalid separator
        'usr-', // No content after prefix
        'usr-123!', // Special characters
        'usr-123 456', // Spaces
        'usr', // No separator
        '', // Empty string
        'usr-é123', // Non-ASCII characters
      ];

      invalidIds.forEach(id => {
        expect(isValidUserId(id)).toBe(false);
      });
    });
  });

  describe('isValidTransactionId', () => {
    it('should validate correct transaction IDs', () => {
      const validIds = [
        'tan-123',
        'tan-abc',
        'tan-ABC',
        'tan-123abc',
        'tan-abcDEF123456',
        'tan-a1B2c3',
      ];

      validIds.forEach(id => {
        expect(isValidTransactionId(id)).toBe(true);
      });
    });

    it('should reject invalid transaction IDs', () => {
      const invalidIds = [
        'transaction-123', // Wrong prefix
        'tan_123', // Invalid separator
        'tan-', // No content after prefix
        'tan-123!', // Special characters
        'tan-123 456', // Spaces
        'tan', // No separator
        '', // Empty string
        'tan-é123', // Non-ASCII characters
      ];

      invalidIds.forEach(id => {
        expect(isValidTransactionId(id)).toBe(false);
      });
    });
  });

  describe('isValidAccountNumber', () => {
    it('should validate correct account numbers', () => {
      const validNumbers = [
        '01000000',
        '01123456',
        '01999999',
      ];

      validNumbers.forEach(number => {
        expect(isValidAccountNumber(number)).toBe(true);
      });
    });

    it('should reject invalid account numbers', () => {
      const invalidNumbers = [
        '02123456', // Doesn't start with 01
        '01123', // Too short
        '011234567', // Too long
        '0112345', // 7 digits but wrong format
        'ab123456', // Invalid prefix
        '01abcdef', // Contains letters
        '01.12345', // Contains special characters
        '', // Empty string
        '00123456', // Starts with 00
        '01-12345', // Contains hyphen
      ];

      invalidNumbers.forEach(number => {
        expect(isValidAccountNumber(number)).toBe(false);
      });
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      const validNumbers = [
        '+1234567890', // US format
        '+44123456789', // UK format
        '+8613912345678', // China format
        '+911234567890', // India format
        '+61412345678', // Australia format
        '+27123456789', // South Africa format
        '+12', // Minimum length (country code + 1 digit)
        '+123456789012345', // Maximum length (15 digits)
      ];

      validNumbers.forEach(number => {
        expect(isValidPhoneNumber(number)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '1234567890', // Missing +
        '+0234567890', // Starts with 0
        '+abc1234567', // Contains letters
        '+12 34567890', // Contains spaces
        '+12.34567890', // Contains special characters
        '+', // Only plus
        '+1', // Too short (needs at least 2 digits)
        '+1234567890123456', // Too long (more than 15 digits)
        '++1234567890', // Multiple plus signs
        '+12-345-67890', // Contains hyphens
        '+12(345)67890', // Contains parentheses
        '', // Empty string
        '+é1234567890', // Non-ASCII characters
      ];

      invalidNumbers.forEach(number => {
        expect(isValidPhoneNumber(number)).toBe(false);
      });
    });
  });
}); 
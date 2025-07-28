import {
  generateAccountNumber,
  isValidAccountNumber,
} from '../id-generator.util';

describe('ID Generator Utils', () => {
  describe('generateAccountNumber', () => {
    it('should generate account number matching pattern ^01\\d{6}$', () => {
      // Test multiple times to ensure consistent pattern
      for (let i = 0; i < 1000; i++) {
        const accountNumber = generateAccountNumber();
        expect(accountNumber).toMatch(/^01\d{6}$/);
      }
    });

    it('should always generate 8-digit number starting with 01', () => {
      const accountNumber = generateAccountNumber();
      expect(accountNumber).toHaveLength(8);
      expect(accountNumber.startsWith('01')).toBe(true);
    });

    it('should generate numbers within valid range', () => {
      const accountNumber = generateAccountNumber();
      const numericPart = parseInt(accountNumber.slice(2), 10);
      expect(numericPart).toBeGreaterThanOrEqual(0);
      expect(numericPart).toBeLessThanOrEqual(999999);
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
      ];

      invalidNumbers.forEach(number => {
        expect(isValidAccountNumber(number)).toBe(false);
      });
    });
  });

  // Add other ID generator tests...
}); 
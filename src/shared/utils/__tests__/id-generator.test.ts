import { generateUserId, generateTransactionId, generateAccountNumber } from '../id-generator.util';
import { isValidUserId, isValidAccountNumber } from '../validation.utils';

describe('ID Generator Utils', () => {
  describe('generateUserId', () => {
    it('should generate valid user IDs', () => {
      // Test multiple generations to ensure pattern consistency
      for (let i = 0; i < 100; i++) {
        const id = generateUserId();
        expect(isValidUserId(id)).toBe(true);
        expect(id).toMatch(/^usr-[0-9a-f]{16}$/); // Hex format
      }
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateUserId());
      }
      expect(ids.size).toBe(1000); // All IDs should be unique
    });
  });

  describe('generateTransactionId', () => {
    it('should generate transaction IDs in correct format', () => {
      // Test multiple generations to ensure pattern consistency
      for (let i = 0; i < 100; i++) {
        const id = generateTransactionId();
        expect(id).toMatch(/^tan-[0-9a-f]{16}$/); // Hex format
      }
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateTransactionId());
      }
      expect(ids.size).toBe(1000); // All IDs should be unique
    });

    it('should generate IDs with correct prefix and length', () => {
      const id = generateTransactionId();
      expect(id.startsWith('tan-')).toBe(true);
      expect(id.length).toBe(20); // 'tan-' (4) + hex string (16)
    });
  });

  describe('generateAccountNumber', () => {
    it('should generate valid account numbers', () => {
      // Test multiple generations to ensure pattern consistency
      for (let i = 0; i < 100; i++) {
        const number = generateAccountNumber();
        expect(isValidAccountNumber(number)).toBe(true);
        expect(number).toMatch(/^01\d{6}$/);
      }
    });

    it('should generate numbers in the correct range', () => {
      for (let i = 0; i < 100; i++) {
        const number = generateAccountNumber();
        const value = parseInt(number, 10);
        expect(value).toBeGreaterThanOrEqual(1000000);
        expect(value).toBeLessThanOrEqual(1999999);
      }
    });

    it('should always be 8 digits long', () => {
      for (let i = 0; i < 100; i++) {
        const number = generateAccountNumber();
        expect(number.length).toBe(8);
      }
    });
  });
}); 
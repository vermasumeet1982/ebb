import { z } from 'zod';
import { CreateTransactionSchema } from '../transaction.schema';
import { TransactionType } from '../../entities/transaction';
import { Currency } from '../../entities/account';

describe('CreateTransactionSchema', () => {
  describe('Valid cases', () => {
    it.each([
      {
        description: 'minimum valid amount with deposit',
        input: { amount: 0.01, currency: Currency.GBP, type: TransactionType.DEPOSIT },
      },
      {
        description: 'maximum valid amount with withdrawal',
        input: { amount: 10000.00, currency: Currency.GBP, type: TransactionType.WITHDRAWAL },
      },
      {
        description: 'valid amount with 2 decimal places',
        input: { amount: 123.45, currency: Currency.GBP, type: TransactionType.DEPOSIT },
      },
      {
        description: 'valid amount with 1 decimal place',
        input: { amount: 50.5, currency: Currency.GBP, type: TransactionType.WITHDRAWAL },
      },
      {
        description: 'whole number amount',
        input: { amount: 100, currency: Currency.GBP, type: TransactionType.DEPOSIT },
      },
      {
        description: 'with valid reference',
        input: { 
          amount: 25.00, 
          currency: Currency.GBP, 
          type: TransactionType.DEPOSIT,
          reference: 'Salary payment'
        },
      },
      {
        description: 'with maximum length reference',
        input: { 
          amount: 25.00, 
          currency: Currency.GBP, 
          type: TransactionType.DEPOSIT,
          reference: 'A'.repeat(255)
        },
      },
      {
        description: 'without reference (optional)',
        input: { amount: 75.25, currency: Currency.GBP, type: TransactionType.WITHDRAWAL },
      },
    ])('should pass validation for $description', ({ input }) => {
      const result = CreateTransactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid amount cases', () => {
    it.each([
      {
        description: 'zero amount',
        input: { amount: 0, currency: Currency.GBP, type: TransactionType.DEPOSIT },
        expectedError: 'Amount must be greater than 0.00',
      },
      {
        description: 'negative amount',
        input: { amount: -10.50, currency: Currency.GBP, type: TransactionType.DEPOSIT },
        expectedError: 'Amount must be greater than 0.00',
      },
      {
        description: 'amount exceeding maximum',
        input: { amount: 10000.01, currency: Currency.GBP, type: TransactionType.DEPOSIT },
        expectedError: 'Amount must not exceed 10000.00',
      },
      {
        description: 'amount with more than 2 decimal places',
        input: { amount: 123.456, currency: Currency.GBP, type: TransactionType.DEPOSIT },
        expectedError: 'Amount must have at most 2 decimal places',
      },
      {
        description: 'amount with 3 decimal places',
        input: { amount: 50.123, currency: Currency.GBP, type: TransactionType.DEPOSIT },
        expectedError: 'Amount must have at most 2 decimal places',
      },
      {
        description: 'missing amount',
        input: { currency: Currency.GBP, type: TransactionType.DEPOSIT },
        expectedError: 'Required',
      },
    ])('should fail validation for $description', ({ input, expectedError }) => {
      const result = CreateTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors[0]?.message).toBe(expectedError);
    });
  });

  describe('Invalid currency cases', () => {
    it.each([
      {
        description: 'invalid currency string',
        input: { amount: 100.00, currency: 'USD', type: TransactionType.DEPOSIT },
        expectedError: 'Currency must be "GBP"',
      },
      {
        description: 'lowercase currency',
        input: { amount: 100.00, currency: 'gbp', type: TransactionType.DEPOSIT },
        expectedError: 'Currency must be "GBP"',
      },
      {
        description: 'missing currency',
        input: { amount: 100.00, type: TransactionType.DEPOSIT },
        expectedError: 'Currency must be "GBP"',
      },
      {
        description: 'null currency',
        input: { amount: 100.00, currency: null, type: TransactionType.DEPOSIT },
        expectedError: 'Currency must be "GBP"',
      },
    ])('should fail validation for $description', ({ input, expectedError }) => {
      const result = CreateTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors[0]?.message).toBe(expectedError);
    });
  });

  describe('Invalid transaction type cases', () => {
    it.each([
      {
        description: 'invalid transaction type string',
        input: { amount: 100.00, currency: Currency.GBP, type: 'transfer' },
        expectedError: 'Transaction type must be "deposit" or "withdrawal"',
      },
      {
        description: 'uppercase transaction type',
        input: { amount: 100.00, currency: Currency.GBP, type: 'DEPOSIT' },
        expectedError: 'Transaction type must be "deposit" or "withdrawal"',
      },
      {
        description: 'missing transaction type',
        input: { amount: 100.00, currency: Currency.GBP },
        expectedError: 'Transaction type must be "deposit" or "withdrawal"',
      },
      {
        description: 'null transaction type',
        input: { amount: 100.00, currency: Currency.GBP, type: null },
        expectedError: 'Transaction type must be "deposit" or "withdrawal"',
      },
    ])('should fail validation for $description', ({ input, expectedError }) => {
      const result = CreateTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors[0]?.message).toBe(expectedError);
    });
  });

  describe('Invalid reference cases', () => {
    it.each([
      {
        description: 'empty string reference',
        input: { 
          amount: 100.00, 
          currency: Currency.GBP, 
          type: TransactionType.DEPOSIT,
          reference: ''
        },
        expectedError: 'Reference cannot be empty',
      },
      {
        description: 'reference exceeding maximum length',
        input: { 
          amount: 100.00, 
          currency: Currency.GBP, 
          type: TransactionType.DEPOSIT,
          reference: 'A'.repeat(256)
        },
        expectedError: 'Reference must be at most 255 characters',
      },
    ])('should fail validation for $description', ({ input, expectedError }) => {
      const result = CreateTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors[0]?.message).toBe(expectedError);
    });
  });

  describe('Unknown fields validation', () => {
    it('should reject unknown fields due to strict validation', () => {
      const input = {
        amount: 100.00,
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        unknownField: 'should not be allowed',
      };

      const result = CreateTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors[0]?.message).toBe('Unknown fields are not allowed');
    });
  });

  describe('Type inference', () => {
    it('should correctly infer TypeScript types', () => {
      const validInput = {
        amount: 123.45,
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        reference: 'Test reference',
      };

      const result = CreateTransactionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        // Type assertions to verify correct inference
        expect(typeof result.data.amount).toBe('number');
        expect(result.data.currency).toBe(Currency.GBP);
        expect(result.data.type).toBe(TransactionType.DEPOSIT);
        expect(typeof result.data.reference).toBe('string');
      }
    });

    it('should handle optional reference field correctly', () => {
      const inputWithoutReference = {
        amount: 123.45,
        currency: Currency.GBP,
        type: TransactionType.WITHDRAWAL,
      };

      const result = CreateTransactionSchema.safeParse(inputWithoutReference);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.reference).toBeUndefined();
      }
    });
  });
}); 
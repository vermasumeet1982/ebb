import { CreateBankAccountSchema, UpdateBankAccountSchema } from '../account.schema';
import { AccountType } from '../../entities/account';
import { z } from 'zod';

describe('Account Schema Validation', () => {
  describe('CreateBankAccountSchema', () => {
    it.each([
      {
        scenario: 'complete valid account',
        data: {
          name: 'My Personal Account',
          accountType: AccountType.PERSONAL,
        },
      },
      {
        scenario: 'name with maximum length',
        data: {
          name: 'A'.repeat(100),
          accountType: AccountType.PERSONAL,
        },
      },
    ])('should validate $scenario', ({ data }) => {
      const result = CreateBankAccountSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      
    });

    it.each([
      {
        scenario: 'missing name',
        data: { accountType: AccountType.PERSONAL },
        error: { path: ['name'], message: 'Required' },
      },
      {
        scenario: 'empty name',
        data: { name: '', accountType: AccountType.PERSONAL },
        error: { path: ['name'], message: 'Account name is required' },
      },
      {
        scenario: 'name too long',
        data: { name: 'A'.repeat(101), accountType: AccountType.PERSONAL },
        error: { path: ['name'], message: 'Account name must be at most 100 characters' },
      },
      {
        scenario: 'whitespace-only name',
        data: { name: '   ', accountType: AccountType.PERSONAL },
        error: { path: ['name'], message: 'Account name cannot be empty or contain only whitespace' },
      },
    ])('should reject invalid name - $scenario', ({ data, error }) => {
      const result = CreateBankAccountSchema.safeParse(data);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors).toContainEqual(expect.objectContaining(error));
    });

    it.each([
      {
        scenario: 'missing account type',
        data: { name: 'Test Account' },
        error: { path: ['accountType'], message: 'Account type must be "personal"' },
      },
      {
        scenario: 'invalid account type',
        data: { name: 'Test Account', accountType: 'savings' },
        error: { path: ['accountType'], message: 'Account type must be "personal"' },
      },
      {
        scenario: 'empty account type',
        data: { name: 'Test Account', accountType: '' },
        error: { path: ['accountType'], message: 'Account type must be "personal"' },
      },
    ])('should reject invalid account type - $scenario', ({ data, error }) => {
      const result = CreateBankAccountSchema.safeParse(data);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors).toContainEqual(expect.objectContaining(error));
    });

    it.each([
      {
        scenario: 'valid account + unknown field',
        data: {
          name: 'Test Account',
          accountType: AccountType.PERSONAL,
          unknownField: 'value',
        },
      },
      {
        scenario: 'only unknown fields',
        data: {
          unknownField: 'value',
          anotherUnknown: 123,
        },
      },
      {
        scenario: 'multiple unknown fields',
        data: {
          name: 'Test Account',
          accountType: AccountType.PERSONAL,
          extraField: true,
          trackingId: 'abc123',
        },
      },
    ])('should reject unknown fields - $scenario', ({ data }) => {
      const result = CreateBankAccountSchema.safeParse(data);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors).toContainEqual(
        expect.objectContaining({
          message: 'Unknown fields are not allowed',
        })
      );
    });

    it.each([
      {
        scenario: 'null values',
        data: {
          name: null,
          accountType: null,
        },
        expectedErrors: 2,
      },
      {
        scenario: 'undefined values',
        data: {
          name: undefined,
          accountType: undefined,
        },
        expectedErrors: 2,
      },
      {
        scenario: 'empty object',
        data: {},
        expectedErrors: 2, // name and accountType
      },
    ])('should handle edge cases - $scenario', ({ data, expectedErrors }) => {
      const result = CreateBankAccountSchema.safeParse(data);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors).toHaveLength(expectedErrors);
    });
  });

  describe('UpdateBankAccountSchema', () => {
    it.each([
      {
        scenario: 'name only',
        data: { name: 'New Account Name' },
      },
      {
        scenario: 'account type only',
        data: { accountType: AccountType.PERSONAL },
      },
      {
        scenario: 'both name and account type',
        data: { name: 'New Name', accountType: AccountType.PERSONAL },
      },
      {
        scenario: 'empty object (no changes)',
        data: {},
      },
    ])('should validate correct update data - $scenario', ({ data }) => {
      const result = UpdateBankAccountSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it.each([
      {
        scenario: 'empty name',
        data: { name: '' },
        error: 'Name is required',
      },
      {
        scenario: 'single space name',
        data: { name: ' ' },
        error: 'Name cannot be empty or contain only whitespace',
      },
      {
        scenario: 'multiple spaces name',
        data: { name: '   ' },
        error: 'Name cannot be empty or contain only whitespace',
      },
    ])('should reject invalid name - $scenario', ({ data, error }) => {
      const result = UpdateBankAccountSchema.safeParse(data);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors[0]?.message).toBe(error);
    });

    it('should validate accountType when provided', () => {
      const invalidData = {
        accountType: 'savings', // Invalid type
      };

      const result = UpdateBankAccountSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors[0]?.message).toBe('Invalid enum value. Expected \'personal\', received \'savings\'');
    });

    it.each([
      {
        scenario: 'single unknown field',
        data: { unknownField: 'value' },
      },
      {
        scenario: 'valid field with unknown field',
        data: { name: 'Valid Name', extraField: true },
      },
      {
        scenario: 'valid enum with unknown field',
        data: { accountType: AccountType.PERSONAL, unknownField: 123 },
      },
    ])('should reject unknown fields - $scenario', ({ data }) => {
      const result = UpdateBankAccountSchema.safeParse(data);
      expect(result.success).toBe(false);
      const zodError = result.error as z.ZodError;
      expect(zodError.errors[0]?.message).toBe('Unknown fields are not allowed');
    });

    it.each([
      {
        scenario: 'name update',
        data: { name: 'New Name' },
      },
      {
        scenario: 'account type update',
        data: { accountType: AccountType.PERSONAL },
      },
    ])('should allow partial updates - $scenario', ({ data }) => {
      const result = UpdateBankAccountSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
}); 
import { CreateBankAccountSchema } from '../account.schema';
import { AccountType } from '../../entities/account';

describe('Account Schema Validation', () => {
  describe('CreateBankAccountSchema', () => {
    const validAccount = {
      name: 'My Personal Account',
      accountType: AccountType.PERSONAL,
    };

    describe('Success cases', () => {
      it('should validate a complete bank account request', () => {
        const result = CreateBankAccountSchema.safeParse(validAccount);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(validAccount);
      });

      it('should validate name with maximum length', () => {
        const longName = 'A'.repeat(100);
        const accountWithLongName = { ...validAccount, name: longName };

        const result = CreateBankAccountSchema.safeParse(accountWithLongName);
        expect(result.success).toBe(true);
        expect(result.data?.name).toBe(longName);
      });
    });

    describe('Name validation', () => {
      it('should reject missing name', () => {
        const { name, ...invalidAccount } = validAccount;

        const result = CreateBankAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: 'Required',
          })
        );
      });

      it('should reject empty name', () => {
        const invalidAccount = { ...validAccount, name: '' };

        const result = CreateBankAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: 'Account name is required',
          })
        );
      });

      it('should reject name exceeding maximum length', () => {
        const invalidAccount = { ...validAccount, name: 'A'.repeat(101) };

        const result = CreateBankAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: 'Account name must be at most 100 characters',
          })
        );
      });

      it('should reject whitespace-only name', () => {
        const invalidAccount = { ...validAccount, name: '   ' };

        const result = CreateBankAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: 'Account name cannot be empty or contain only whitespace',
          })
        );
      });
    });

    describe('Account type validation', () => {
      it('should reject missing account type', () => {
        const { accountType, ...invalidAccount } = validAccount;

        const result = CreateBankAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['accountType'],
            message: 'Account type must be "personal"',
          })
        );
      });

      it('should reject invalid account type', () => {
        const invalidAccount = { ...validAccount, accountType: 'savings' };

        const result = CreateBankAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['accountType'],
            message: 'Account type must be "personal"',
          })
        );
      });

      it('should reject empty account type', () => {
        const invalidAccount = { ...validAccount, accountType: '' };

        const result = CreateBankAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['accountType'],
            message: 'Account type must be "personal"',
          })
        );
      });
    });

    describe('Unknown fields', () => {
      it.each([
        {
          accountData: { ...validAccount, unknownField: 'value' },
          description: 'valid account + unknown field',
        },
        {
          accountData: { unknownField: 'value', anotherUnknown: 123 },
          description: 'only unknown fields',
        },
        {
          accountData: { ...validAccount, extraField: true, trackingId: 'abc123' },
          description: 'multiple valid fields + unknown fields',
        },
      ])('should reject $description', ({ accountData }) => {
        const result = CreateBankAccountSchema.safeParse(accountData);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            message: 'Unknown fields are not allowed',
          })
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle null values', () => {
        const invalidAccount = {
          name: null,
          accountType: null,
        };

        const result = CreateBankAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
      });

      it('should handle undefined values', () => {
        const invalidAccount = {
          name: undefined,
          accountType: undefined,
        };

        const result = CreateBankAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
      });

      it('should handle empty object', () => {
        const result = CreateBankAccountSchema.safeParse({});
        expect(result.success).toBe(false);
        expect(result.error?.errors).toHaveLength(2); // name, accountType
      });
    });
  });
}); 
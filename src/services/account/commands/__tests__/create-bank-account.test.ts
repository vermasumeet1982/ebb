import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { createBankAccount } from '../create-bank-account';
import { AccountType, Currency, SORT_CODE } from '../../entities/account';
import { ConflictError } from '../../../../shared/utils/error.utils';

// Mock Prisma client
const mockPrisma = {
  bankAccount: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as unknown as PrismaClient;

describe('createBankAccount', () => {
  const validRequest = {
    name: 'My Personal Account',
    accountType: AccountType.PERSONAL,
  };

  const userId = 'usr-abc123';
  const initialBalance = new Decimal(0);

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear console.error mock counts
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Account number generation', () => {
    it('should generate a unique account number', async () => {
      // Arrange
      (mockPrisma.bankAccount.findUnique as jest.Mock)
        .mockResolvedValueOnce(null); // First call returns null (number is unique)

      const expectedBankAccount = {
        sortCode: SORT_CODE,
        name: validRequest.name,
        accountType: validRequest.accountType,
        balance: initialBalance,
        currency: Currency.GBP,
        userId,
        createdTimestamp: expect.any(Date),
        updatedTimestamp: expect.any(Date),
      };

      (mockPrisma.bankAccount.create as jest.Mock).mockImplementation((args) => ({
        ...args.data,
        id: 'acc-123', // Internal ID added by Prisma
      }));

      // Act
      const result = await createBankAccount(mockPrisma, userId, validRequest);

      // Assert
      expect(result.accountNumber).toMatch(/^01\d{6}$/); // Pattern: ^01\d{6}$
      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...expectedBankAccount,
          accountNumber: expect.stringMatching(/^01\d{6}$/),
        }),
      });
    });

    it('should retry if generated account number already exists', async () => {
      // Arrange
      const existingAccount = { id: 'acc-123', accountNumber: '01123456' };
      (mockPrisma.bankAccount.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingAccount) // First number exists
        .mockResolvedValueOnce(null); // Second number is unique

      const expectedBankAccount = {
        sortCode: SORT_CODE,
        name: validRequest.name,
        accountType: validRequest.accountType,
        balance: initialBalance,
        currency: Currency.GBP,
        userId,
        createdTimestamp: expect.any(Date),
        updatedTimestamp: expect.any(Date),
      };

      (mockPrisma.bankAccount.create as jest.Mock).mockImplementation((args) => ({
        ...args.data,
        id: 'acc-456', // Internal ID added by Prisma
      }));

      // Act
      const result = await createBankAccount(mockPrisma, userId, validRequest);

      // Assert
      expect(result.accountNumber).not.toBe(existingAccount.accountNumber);
      expect(result.accountNumber).toMatch(/^01\d{6}$/);
      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...expectedBankAccount,
          accountNumber: expect.stringMatching(/^01\d{6}$/),
        }),
      });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Account number collision on attempt 1/20')
      );
    });

    it('should throw ConflictError after max retries', async () => {
      // Arrange
      const existingAccount = { id: 'acc-123', accountNumber: '01123456' };
      // Mock findUnique to always return an existing account
      (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(existingAccount);

      // Act & Assert
      const error = await createBankAccount(mockPrisma, userId, validRequest)
        .catch(err => err);
      
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.message).toBe('Failed to generate unique account number after 20 attempts');
      
      // Should have tried 20 times
      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledTimes(20);
      expect(mockPrisma.bankAccount.create).not.toHaveBeenCalled();
      
      // Should have logged each collision
      expect(console.error).toHaveBeenCalledTimes(20);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Account number collision on attempt 20/20')
      );
    });
  });

  describe('Bank account creation', () => {
    it('should create a bank account with correct defaults', async () => {
      // Arrange
      (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(null);
      const createdAccount = {
        id: 'acc-123',
        accountNumber: '01123456',
        sortCode: SORT_CODE,
        name: validRequest.name,
        accountType: validRequest.accountType,
        balance: initialBalance,
        currency: Currency.GBP,
        userId,
        createdTimestamp: new Date(),
        updatedTimestamp: new Date(),
      };
      (mockPrisma.bankAccount.create as jest.Mock).mockResolvedValue(createdAccount);

      // Act
      const result = await createBankAccount(mockPrisma, userId, validRequest);

      // Assert
      expect(result).toEqual(createdAccount);
      expect(result.balance.equals(initialBalance)).toBe(true); // Compare Decimals
      expect(result.currency).toBe(Currency.GBP); // Default currency is GBP
      expect(result.sortCode).toBe(SORT_CODE);
    });

    it('should set timestamps correctly', async () => {
      // Arrange
      (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(null);
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      // Act
      await createBankAccount(mockPrisma, userId, validRequest);

      // Assert
      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          createdTimestamp: now,
          updatedTimestamp: now,
        }),
      });

      jest.useRealTimers();
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(null);
      const dbError = new Error('Database connection failed');
      (mockPrisma.bankAccount.create as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(createBankAccount(mockPrisma, userId, validRequest))
        .rejects.toThrow('Database connection failed');
    });
  });
}); 
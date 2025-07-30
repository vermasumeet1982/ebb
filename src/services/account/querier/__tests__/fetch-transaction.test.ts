import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { fetchTransaction } from '../fetch-transaction';
import { NotFoundError, ForbiddenError } from '../../../../shared/utils/error.utils';
import { TransactionType } from '../../entities/transaction';
import { Currency } from '../../entities/account';

describe('fetchTransaction', () => {
  const mockAccountNumber = '01234567';
  const mockTransactionId = 'tan-abc123';
  const mockUserId = 'user-internal-id';
  const mockCustomerUserId = 'usr-customer123';

  // Mock transaction data
  const mockTransaction = {
    id: 'trans-1',
    transactionId: mockTransactionId,
    amount: new Decimal('100.50'),
    currency: Currency.GBP,
    type: TransactionType.DEPOSIT,
    reference: 'Test transaction',
    userId: mockCustomerUserId,
    accountNumber: mockAccountNumber,
    createdTimestamp: new Date('2025-01-01T10:00:00Z'),
  };

  // Mock Prisma Client
  const mockPrisma = {
    bankAccount: {
      findUnique: jest.fn(),
    },
    transaction: {
      findFirst: jest.fn(),
    },
  } as unknown as PrismaClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization and validation', () => {
    it('should throw NotFoundError when account does not exist', async () => {
      // Arrange
      mockPrisma.bankAccount.findUnique = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId)
      ).rejects.toThrow('Bank account not found');

      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({
        where: { accountNumber: mockAccountNumber },
        include: {
          user: {
            select: { id: true },
          },
        },
      });
    });

    it('should throw ForbiddenError when account belongs to different user', async () => {
      // Arrange
      const mockAccount = {
        id: 'account-id',
        accountNumber: mockAccountNumber,
        user: {
          id: 'different-user-id', // Different from mockUserId
        },
      };
      mockPrisma.bankAccount.findUnique = jest.fn().mockResolvedValue(mockAccount);

      // Act & Assert
      await expect(
        fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId)
      ).rejects.toThrow(ForbiddenError);
      await expect(
        fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId)
      ).rejects.toThrow('Not authorized to access this account');

      expect(mockPrisma.transaction.findFirst).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when transaction does not exist', async () => {
      // Arrange
      const mockAccount = {
        id: 'account-id',
        accountNumber: mockAccountNumber,
        user: {
          id: mockUserId,
        },
      };
      mockPrisma.bankAccount.findUnique = jest.fn().mockResolvedValue(mockAccount);
      mockPrisma.transaction.findFirst = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId)
      ).rejects.toThrow('Transaction not found');

      expect(mockPrisma.transaction.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [
            { accountNumber: mockAccountNumber },
            { transactionId: mockTransactionId },
          ],
        },
      });
    });
  });

  describe('Successful transaction fetch', () => {
    const mockAccount = {
      id: 'account-id',
      accountNumber: mockAccountNumber,
      user: {
        id: mockUserId, // Matches the requesting user
      },
    };

    beforeEach(() => {
      mockPrisma.bankAccount.findUnique = jest.fn().mockResolvedValue(mockAccount);
      mockPrisma.transaction.findFirst = jest.fn().mockResolvedValue(mockTransaction);
    });

    it('should return transaction when all validations pass', async () => {
      // Act
      const result = await fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId);

      // Assert
      expect(result).toEqual(mockTransaction);
      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({
        where: { accountNumber: mockAccountNumber },
        include: {
          user: {
            select: { id: true },
          },
        },
      });
      expect(mockPrisma.transaction.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [
            { accountNumber: mockAccountNumber },
            { transactionId: mockTransactionId },
          ],
        },
      });
    });

    it('should properly handle decimal amounts', async () => {
      // Arrange
      const transactionWithDecimal = {
        ...mockTransaction,
        amount: { toString: () => '123.45' }, // Mock Prisma Decimal
      };
      mockPrisma.transaction.findFirst = jest.fn().mockResolvedValue(transactionWithDecimal);

      // Act
      const result = await fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId);

      // Assert
      expect(result).toBeDefined();
      expect(result.amount.toString()).toBe('123.45');
    });

    it('should handle transactions with and without reference', async () => {
      // Arrange - with reference
      const withReference = await fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId);
      expect(withReference.reference).toBe('Test transaction');

      // Arrange - without reference
      const transactionWithoutRef = {
        ...mockTransaction,
        reference: null,
      };
      mockPrisma.transaction.findFirst = jest.fn().mockResolvedValue(transactionWithoutRef);

      // Act
      const withoutReference = await fetchTransaction(mockPrisma, mockAccountNumber, mockTransactionId, mockUserId);

      // Assert
      expect(withoutReference.reference).toBeUndefined();
    });
  });
}); 
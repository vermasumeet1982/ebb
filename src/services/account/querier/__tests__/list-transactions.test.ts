import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { listTransactions } from '../list-transactions';
import { NotFoundError, ForbiddenError } from '../../../../shared/utils/error.utils';
import { TransactionType } from '../../entities/transaction';
import { Currency } from '../../entities/account';

describe('listTransactions', () => {
  const mockAccountNumber = '01234567';
  const mockUserId = 'user-internal-id';
  const mockCustomerUserId = 'usr-customer123';

  // Mock data
  const mockDbTransactions = [
    {
      id: 'trans-3',
      transactionId: 'tan-xyz789',
      amount: new Decimal('75.00'),
      currency: Currency.GBP,
      type: TransactionType.DEPOSIT,
      reference: 'Middle transaction',
      userId: mockCustomerUserId,
      accountNumber: mockAccountNumber,
      createdTimestamp: new Date('2025-01-02T12:00:00Z'), // Middle timestamp
    },
    {
      id: 'trans-1',
      transactionId: 'tan-abc123',
      amount: new Decimal('100.50'),
      currency: Currency.GBP,
      type: TransactionType.DEPOSIT,
      reference: 'Oldest transaction',
      userId: mockCustomerUserId,
      accountNumber: mockAccountNumber,
      createdTimestamp: new Date('2025-01-01T10:00:00Z'), // Oldest timestamp
    },
    {
      id: 'trans-2',
      transactionId: 'tan-def456',
      amount: new Decimal('25.00'),
      currency: Currency.GBP,
      type: TransactionType.WITHDRAWAL,
      reference: 'Newest transaction',
      userId: mockCustomerUserId,
      accountNumber: mockAccountNumber,
      createdTimestamp: new Date('2025-01-03T15:00:00Z'), // Newest timestamp
    },
  ];

  // Mock Prisma Client
  const mockPrisma = {
    bankAccount: {
      findUnique: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
    },
  } as unknown as PrismaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation to the default behavior
    (mockPrisma.transaction.findMany as jest.Mock).mockImplementation((params) => {
      console.log('Mock findMany called with params:', JSON.stringify(params));
      
      // Filter by account number
      let result = mockDbTransactions.filter(t => {
        console.log('Comparing:', t.accountNumber, 'with', params.where.accountNumber);
        return t.accountNumber === params.where.accountNumber;
      });
      
      // Sort by timestamp
      if (params.orderBy?.createdTimestamp === 'desc') {

        result = [...result].sort((a, b) => {
          const aTime = new Date(a.createdTimestamp).getTime();
          const bTime = new Date(b.createdTimestamp).getTime();
          return bTime - aTime;
        });
      }
      return result;
    });
  });

  describe('Authorization and validation', () => {
    it('should throw NotFoundError when account does not exist', async () => {
      // Arrange
      mockPrisma.bankAccount.findUnique = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        listTransactions(mockPrisma, mockAccountNumber, mockUserId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        listTransactions(mockPrisma, mockAccountNumber, mockUserId)
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
        listTransactions(mockPrisma, mockAccountNumber, mockUserId)
      ).rejects.toThrow(ForbiddenError);
      await expect(
        listTransactions(mockPrisma, mockAccountNumber, mockUserId)
      ).rejects.toThrow('Not authorized to access this account');

      expect(mockPrisma.transaction.findMany).not.toHaveBeenCalled();
    });
  });

  describe('Successful transaction listing', () => {
    const mockAccount = {
      id: 'account-id',
      accountNumber: mockAccountNumber,
      user: {
        id: mockUserId, // Matches the requesting user
      },
    };

    beforeEach(() => {
      mockPrisma.bankAccount.findUnique = jest.fn().mockResolvedValue(mockAccount);
    });

    it('should return empty array when account has no transactions', async () => {
      // Arrange
      mockPrisma.transaction.findMany = jest.fn().mockResolvedValue([]);

      // Act
      const result = await listTransactions(mockPrisma, mockAccountNumber, mockUserId);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { accountNumber: mockAccountNumber },
        orderBy: { createdTimestamp: 'desc' },
      });
    });

    it('should return transactions ordered by most recent first', async () => {
      // Arrange
      // Verify mock data is set up correctly
      const allTransactionsHaveCorrectAccount = mockDbTransactions.every(t => t.accountNumber === mockAccountNumber);
      expect(allTransactionsHaveCorrectAccount).toBe(true);
      console.log('Mock account number:', mockAccountNumber);
      console.log('Transaction account numbers:', mockDbTransactions.map(t => t.accountNumber));

      // Act
      const result = await listTransactions(mockPrisma, mockAccountNumber, mockUserId);

      // Assert
      expect(result).toHaveLength(3);
      
      // Verify transactions are returned in descending order by createdTimestamp
      expect(result[0]?.createdTimestamp.toISOString()).toBe('2025-01-03T15:00:00.000Z'); // Newest
      expect(result[1]?.createdTimestamp.toISOString()).toBe('2025-01-02T12:00:00.000Z'); // Middle
      expect(result[2]?.createdTimestamp.toISOString()).toBe('2025-01-01T10:00:00.000Z'); // Oldest

      // Verify each transaction's details
      const [newest, middle, oldest] = result;
      expect(newest).toBeDefined();
      expect(middle).toBeDefined();
      expect(oldest).toBeDefined();
      
      // Verify newest transaction
      expect(newest!).toEqual(expect.objectContaining({
        id: 'trans-2',
        transactionId: 'tan-def456',
        amount: expect.any(Decimal),
        currency: Currency.GBP,
        type: TransactionType.WITHDRAWAL,
        reference: 'Newest transaction',
        userId: mockCustomerUserId,
        accountNumber: mockAccountNumber,
        createdTimestamp: new Date('2025-01-03T15:00:00Z'),
      }));
      
      // Verify middle transaction
      expect(middle!).toEqual(expect.objectContaining({
        id: 'trans-3',
        transactionId: 'tan-xyz789',
        amount: expect.any(Decimal),
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        reference: 'Middle transaction',
        userId: mockCustomerUserId,
        accountNumber: mockAccountNumber,
        createdTimestamp: new Date('2025-01-02T12:00:00Z'),
      }));
      
      // Verify oldest transaction
      expect(oldest!).toEqual(expect.objectContaining({
        id: 'trans-1',
        transactionId: 'tan-abc123',
        amount: expect.any(Decimal),
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        reference: 'Oldest transaction',
        userId: mockCustomerUserId,
        accountNumber: mockAccountNumber,
        createdTimestamp: new Date('2025-01-01T10:00:00Z'),
      }));
    });

    it('should properly convert Prisma Decimal to decimal.js Decimal', async () => {
      // Arrange
      const mockDbTransaction = {
        id: 'trans-1',
        transactionId: 'tan-abc123',
        amount: { toString: () => '123.45' }, // Mock Prisma Decimal
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        reference: 'Test',
        userId: mockCustomerUserId,
        accountNumber: mockAccountNumber,
        createdTimestamp: new Date('2025-01-01T10:00:00Z'),
      };
      mockPrisma.transaction.findMany = jest.fn().mockResolvedValue([mockDbTransaction]);

      // Act
      const result = await listTransactions(mockPrisma, mockAccountNumber, mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'trans-1',
            transactionId: 'tan-abc123',
            amount: expect.any(Decimal),
            currency: Currency.GBP,
            type: TransactionType.DEPOSIT,
            reference: 'Test',
            userId: mockCustomerUserId,
            accountNumber: mockAccountNumber,
            createdTimestamp: new Date('2025-01-01T10:00:00Z'),
          }),
        ])
      );

      // Verify decimal conversion
      expect(result[0]!.amount).toBeInstanceOf(Decimal);
      expect(result[0]!.amount.toString()).toBe('123.45');
    });

    it('should handle transactions with and without reference', async () => {
      // Arrange
      const mockDbTransactions = [
        {
          id: 'trans-1',
          transactionId: 'tan-with-ref',
          amount: new Decimal('50.00'),
          currency: Currency.GBP,
          type: TransactionType.DEPOSIT,
          reference: 'With reference',
          userId: mockCustomerUserId,
          accountNumber: mockAccountNumber,
          createdTimestamp: new Date('2025-01-01T10:00:00Z'),
        },
        {
          id: 'trans-2',
          transactionId: 'tan-no-ref',
          amount: new Decimal('25.00'),
          currency: Currency.GBP,
          type: TransactionType.WITHDRAWAL,
          reference: null,
          userId: mockCustomerUserId,
          accountNumber: mockAccountNumber,
          createdTimestamp: new Date('2025-01-01T09:00:00Z'),
        },
      ];
      mockPrisma.transaction.findMany = jest.fn().mockResolvedValue(mockDbTransactions);

      // Act
      const result = await listTransactions(mockPrisma, mockAccountNumber, mockUserId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'trans-1',
            transactionId: 'tan-with-ref',
            reference: 'With reference',
          }),
          expect.objectContaining({
            id: 'trans-2',
            transactionId: 'tan-no-ref',
            // Note: reference should not be present when null
          }),
        ])
      );

      // Verify reference handling specifically
      const transactionWithRef = result.find(t => t.transactionId === 'tan-with-ref');
      const transactionWithoutRef = result.find(t => t.transactionId === 'tan-no-ref');

      expect(transactionWithRef).toHaveProperty('reference', 'With reference');
      expect(transactionWithoutRef).not.toHaveProperty('reference');
    });

    it('should handle multiple transaction types correctly', async () => {
      // Arrange
      const mockDbTransactions = [
        {
          id: 'trans-1',
          transactionId: 'tan-deposit',
          amount: new Decimal('100.00'),
          currency: Currency.GBP,
          type: TransactionType.DEPOSIT,
          reference: 'Deposit test',
          userId: mockCustomerUserId,
          accountNumber: mockAccountNumber,
          createdTimestamp: new Date('2025-01-01T10:00:00Z'),
        },
        {
          id: 'trans-2',
          transactionId: 'tan-withdrawal',
          amount: new Decimal('50.00'),
          currency: Currency.GBP,
          type: TransactionType.WITHDRAWAL,
          reference: 'Withdrawal test',
          userId: mockCustomerUserId,
          accountNumber: mockAccountNumber,
          createdTimestamp: new Date('2025-01-01T09:00:00Z'),
        },
      ];
      mockPrisma.transaction.findMany = jest.fn().mockResolvedValue(mockDbTransactions);

      // Act
      const result = await listTransactions(mockPrisma, mockAccountNumber, mockUserId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'trans-1',
            transactionId: 'tan-deposit',
            type: TransactionType.DEPOSIT,
            reference: 'Deposit test',
          }),
          expect.objectContaining({
            id: 'trans-2',
            transactionId: 'tan-withdrawal',
            type: TransactionType.WITHDRAWAL,
            reference: 'Withdrawal test',
          }),
        ])
      );

      // Verify specific transaction types
      const depositTransaction = result.find(t => t.transactionId === 'tan-deposit');
      const withdrawalTransaction = result.find(t => t.transactionId === 'tan-withdrawal');

      expect(depositTransaction?.type).toBe(TransactionType.DEPOSIT);
      expect(withdrawalTransaction?.type).toBe(TransactionType.WITHDRAWAL);
    });
  });

  describe('Database query validation', () => {
    it('should call database with correct parameters', async () => {
      // Arrange
      const mockAccount = {
        id: 'account-id',
        accountNumber: mockAccountNumber,
        user: { id: mockUserId },
      };
      mockPrisma.bankAccount.findUnique = jest.fn().mockResolvedValue(mockAccount);
      mockPrisma.transaction.findMany = jest.fn().mockResolvedValue([]);

      // Act
      await listTransactions(mockPrisma, mockAccountNumber, mockUserId);

      // Assert
      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({
        where: { accountNumber: mockAccountNumber },
        include: {
          user: {
            select: { id: true },
          },
        },
      });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { accountNumber: mockAccountNumber },
        orderBy: { createdTimestamp: 'desc' },
      });
    });
  });
}); 
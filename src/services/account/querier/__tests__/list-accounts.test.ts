import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { listAccounts } from '../list-accounts';
import { AccountType, Currency } from '../../entities/account';

// Mock Prisma client
const mockPrisma = {
  bankAccount: {
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('listAccounts', () => {
  const userId = 'usr-123';
  const now = new Date('2024-01-01T00:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array when user has no accounts', async () => {
    // Arrange
    (mockPrisma.bankAccount.findMany as jest.Mock).mockResolvedValue([]);

    // Act
    const result = await listAccounts(mockPrisma, userId);

    // Assert
    expect(result).toEqual([]);
    expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith({
      where: {
        user: {
          id: userId,
        },
      },
      orderBy: {
        createdTimestamp: 'desc',
      },
    });
  });

  it('should return accounts ordered by creation date descending', async () => {
    // Arrange
    const mockAccounts = [
      {
        id: 'acc-2',
        accountNumber: '01234567',
        sortCode: '10-10-10',
        name: 'Second Account',
        accountType: AccountType.PERSONAL,
        balance: new Decimal('100.00'),
        currency: Currency.GBP,
        userId,
        createdTimestamp: new Date('2024-01-02T00:00:00Z'),
        updatedTimestamp: new Date('2024-01-02T00:00:00Z'),
      },
      {
        id: 'acc-1',
        accountNumber: '01234566',
        sortCode: '10-10-10',
        name: 'First Account',
        accountType: AccountType.PERSONAL,
        balance: new Decimal('50.00'),
        currency: Currency.GBP,
        userId,
        createdTimestamp: new Date('2024-01-01T00:00:00Z'),
        updatedTimestamp: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    (mockPrisma.bankAccount.findMany as jest.Mock).mockResolvedValue(mockAccounts);

    // Act
    const result = await listAccounts(mockPrisma, userId);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0]?.accountNumber).toBe('01234567'); // Most recent first
    expect(result[1]?.accountNumber).toBe('01234566');
  });

  it('should correctly map Prisma types to our domain types', async () => {
    // Arrange
    const mockAccount = {
      id: 'acc-1',
      accountNumber: '01234567',
      sortCode: '10-10-10',
      name: 'Test Account',
      accountType: AccountType.PERSONAL,
      balance: new Decimal('100.50'),
      currency: Currency.GBP,
      userId,
      createdTimestamp: now,
      updatedTimestamp: now,
    };

    (mockPrisma.bankAccount.findMany as jest.Mock).mockResolvedValue([mockAccount]);

    // Act
    const result = await listAccounts(mockPrisma, userId);

    // Assert
    expect(result).toHaveLength(1);
    const account = result[0];
    expect(account).toBeDefined();
    if (!account) return; // TypeScript guard

    expect(account).toEqual({
      ...mockAccount,
      accountType: AccountType.PERSONAL,
      currency: Currency.GBP,
      balance: new Decimal('100.50'),
    });
    expect(account.balance).toBeInstanceOf(Decimal);
    expect(account.balance.toFixed(2)).toBe('100.50');
  });

  it('should handle database errors gracefully', async () => {
    // Arrange
    const dbError = new Error('Database connection failed');
    (mockPrisma.bankAccount.findMany as jest.Mock).mockRejectedValue(dbError);

    // Act & Assert
    await expect(listAccounts(mockPrisma, userId))
      .rejects.toThrow('Database connection failed');
  });
}); 
import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { getAccount } from '../get-account';
import { AccountType, Currency } from '../../entities/account';
import { NotFoundError, ForbiddenError } from '../../../../shared/utils/error.utils';

// Mock Prisma client
const mockPrisma = {
  bankAccount: {
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient;

describe('getAccount', () => {
  const userId = 'usr-123';
  const accountNumber = '01234567';
  const now = new Date('2024-01-01T00:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return account when it exists and belongs to user', async () => {
    // Arrange
    const mockAccount = {
      id: 'acc-1',
      accountNumber,
      sortCode: '10-10-10',
      name: 'Test Account',
      accountType: AccountType.PERSONAL,
      balance: new Decimal('100.50'),
      currency: Currency.GBP,
      userId,
      createdTimestamp: now,
      updatedTimestamp: now,
      user: {
        id: userId,
      },
    };

    (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(mockAccount);

    // Act
    const result = await getAccount(mockPrisma, accountNumber, userId);

    // Assert
    expect(result).toEqual({
      ...mockAccount,
      accountType: AccountType.PERSONAL,
      currency: Currency.GBP,
      balance: new Decimal('100.50'),
    });
    expect(result.balance).toBeInstanceOf(Decimal);
    expect(result.balance.toFixed(2)).toBe('100.50');
  });

  it('should throw NotFoundError when account does not exist', async () => {
    // Arrange
    (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(getAccount(mockPrisma, accountNumber, userId))
      .rejects.toThrow(NotFoundError);
    await expect(getAccount(mockPrisma, accountNumber, userId))
      .rejects.toThrow('Bank account not found');
  });

  it('should throw ForbiddenError when account belongs to different user', async () => {
    // Arrange
    const mockAccount = {
      id: 'acc-1',
      accountNumber,
      user: {
        id: 'different-user-id',
      },
    };

    (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(mockAccount);

    // Act & Assert
    await expect(getAccount(mockPrisma, accountNumber, userId))
      .rejects.toThrow(ForbiddenError);
    await expect(getAccount(mockPrisma, accountNumber, userId))
      .rejects.toThrow('Not authorized to access this account');
  });

  it('should handle database errors gracefully', async () => {
    // Arrange
    const dbError = new Error('Database connection failed');
    (mockPrisma.bankAccount.findUnique as jest.Mock).mockRejectedValue(dbError);

    // Act & Assert
    await expect(getAccount(mockPrisma, accountNumber, userId))
      .rejects.toThrow('Database connection failed');
  });
}); 
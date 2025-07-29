import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { updateBankAccount } from '../update-bank-account';
import { AccountType, Currency } from '../../entities/account';
import { NotFoundError, ForbiddenError } from '../../../../shared/utils/errors.util';

// Mock Prisma client
const mockPrisma = {
  bankAccount: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

describe('updateBankAccount', () => {
  const userId = 'usr-123';
  const accountNumber = '01234567';
  const now = new Date('2024-01-01T00:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update account when it exists and belongs to user', async () => {
    // Arrange
    const existingAccount = {
      id: 'acc-1',
      accountNumber,
      sortCode: '10-10-10',
      name: 'Old Name',
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

    const updateData = {
      name: 'New Name',
      accountType: AccountType.PERSONAL,
    };

    const updatedAccount = {
      ...existingAccount,
      name: updateData.name,
      accountType: updateData.accountType,
      updatedTimestamp: new Date('2024-01-02T00:00:00Z'),
    };

    (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(existingAccount);
    (mockPrisma.bankAccount.update as jest.Mock).mockResolvedValue(updatedAccount);

    // Act
    const result = await updateBankAccount(mockPrisma, accountNumber, userId, updateData);

    // Assert
    expect(result).toEqual({
      ...updatedAccount,
      accountType: AccountType.PERSONAL,
      currency: Currency.GBP,
      balance: new Decimal('100.50'),
    });
    expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
      where: { accountNumber },
      data: {
        name: updateData.name,
        accountType: updateData.accountType,
        updatedTimestamp: expect.any(Date),
      },
    });
  });

  it('should return existing account when no changes are provided', async () => {
    // Arrange
    const existingAccount = {
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

    (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(existingAccount);

    // Act
    const result = await updateBankAccount(mockPrisma, accountNumber, userId, {});

    // Assert
    expect(result).toEqual({
      ...existingAccount,
      accountType: AccountType.PERSONAL,
      currency: Currency.GBP,
      balance: new Decimal('100.50'),
    });
    expect(mockPrisma.bankAccount.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when account does not exist', async () => {
    // Arrange
    (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(updateBankAccount(mockPrisma, accountNumber, userId, { name: 'New Name' }))
      .rejects.toThrow(NotFoundError);
    await expect(updateBankAccount(mockPrisma, accountNumber, userId, { name: 'New Name' }))
      .rejects.toThrow('Bank account not found');
  });

  it('should throw ForbiddenError when account belongs to different user', async () => {
    // Arrange
    const existingAccount = {
      id: 'acc-1',
      accountNumber,
      user: {
        id: 'different-user-id',
      },
    };

    (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(existingAccount);

    // Act & Assert
    await expect(updateBankAccount(mockPrisma, accountNumber, userId, { name: 'New Name' }))
      .rejects.toThrow(ForbiddenError);
    await expect(updateBankAccount(mockPrisma, accountNumber, userId, { name: 'New Name' }))
      .rejects.toThrow('Not authorized to update this account');
  });

  it('should handle database errors gracefully', async () => {
    // Arrange
    const existingAccount = {
      id: 'acc-1',
      accountNumber,
      user: {
        id: userId,
      },
    };

    const dbError = new Error('Database connection failed');
    (mockPrisma.bankAccount.findUnique as jest.Mock).mockResolvedValue(existingAccount);
    (mockPrisma.bankAccount.update as jest.Mock).mockRejectedValue(dbError);

    // Act & Assert
    await expect(updateBankAccount(mockPrisma, accountNumber, userId, { name: 'New Name' }))
      .rejects.toThrow('Database connection failed');
  });
}); 
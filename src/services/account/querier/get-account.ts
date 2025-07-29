import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { BankAccount } from '../entities/account';
import { NotFoundError, ForbiddenError } from '@/shared/utils/errors.util';

/**
 * Fetch a bank account by account number
 * @throws {NotFoundError} If account not found
 * @throws {ForbiddenError} If account doesn't belong to user
 */
export async function getAccount(
  prisma: PrismaClient,
  accountNumber: string,
  userId: string
): Promise<BankAccount> {
  // Fetch account with user details
  const account = await prisma.bankAccount.findUnique({
    where: { accountNumber },
    include: {
      user: {
        select: { id: true }, // Only need the internal ID for authorization
      },
    },
  });

  // Handle not found
  if (!account) {
    throw new NotFoundError('Bank account not found');
  }

  // Check authorization
  if (account.user.id !== userId) {
    throw new ForbiddenError('Not authorized to access this account');
  }

  // Map to our domain type
  return {
    ...account,
    accountType: account.accountType as BankAccount['accountType'],
    currency: account.currency as BankAccount['currency'],
    balance: new Decimal(account.balance.toString()), // Convert Prisma Decimal to decimal.js Decimal
  };
} 
import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { Transaction } from '../entities/transaction';
import { NotFoundError, ForbiddenError } from '@/shared/utils/error.utils';

/**
 * List all transactions for a bank account
 * @throws {NotFoundError} If account not found
 * @throws {ForbiddenError} If account doesn't belong to user
 */
export async function listTransactions(
  prisma: PrismaClient,
  accountNumber: string,
  userId: string
): Promise<Transaction[]> {
  // First, verify account exists and user has access
  const account = await prisma.bankAccount.findUnique({
    where: { accountNumber },
    include: {
      user: {
        select: { id: true }, // Only need internal ID for authorization
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

  // Fetch all transactions for this account
  const dbTransactions = await prisma.transaction.findMany({
    where: { accountNumber },
    orderBy: { createdTimestamp: 'desc' }, // Most recent first
  });

  // Map to our domain type
  return dbTransactions.map(transaction => ({
    id: transaction.id,
    transactionId: transaction.transactionId,
    amount: new Decimal(transaction.amount.toString()),
    currency: transaction.currency as Transaction['currency'],
    type: transaction.type as Transaction['type'],
    ...(transaction.reference && { reference: transaction.reference }),
    userId: transaction.userId,
    accountNumber: transaction.accountNumber,
    createdTimestamp: transaction.createdTimestamp,
  }));
} 
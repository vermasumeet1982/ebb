import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { Transaction } from '../entities/transaction';
import { NotFoundError, ForbiddenError } from '@/shared/utils/error.utils';

/**
 * Fetches a single transaction by ID, ensuring the user has access to the account
 */
export async function fetchTransaction(
  prisma: PrismaClient,
  accountNumber: string,
  transactionId: string,
  userId: string,
): Promise<Transaction> {
  // First check if account exists and belongs to user
  const account = await prisma.bankAccount.findUnique({
    where: { accountNumber },
    include: {
      user: {
        select: { id: true },
      },
    },
  });

  if (!account) {
    throw new NotFoundError('Bank account not found');
  }

  if (account.user.id !== userId) {
    throw new ForbiddenError('Not authorized to access this account');
  }

  // Then fetch the transaction
  const dbTransaction = await prisma.transaction.findFirst({
    where: {
      AND: [
        { accountNumber },
        { transactionId },
      ],
    },
  });

  if (!dbTransaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Map to our domain type
  return {
    id: dbTransaction.id,
    transactionId: dbTransaction.transactionId,
    amount: new Decimal(dbTransaction.amount.toString()),
    currency: dbTransaction.currency as Transaction['currency'],
    type: dbTransaction.type as Transaction['type'],
    ...(dbTransaction.reference && { reference: dbTransaction.reference }),
    userId: dbTransaction.userId,
    accountNumber: dbTransaction.accountNumber,
    createdTimestamp: dbTransaction.createdTimestamp,
  };
} 
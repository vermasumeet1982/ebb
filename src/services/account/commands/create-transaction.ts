import { PrismaClient, Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { Transaction, TransactionType } from '../entities/transaction';
import { CreateTransactionRequest } from '../schema/transaction.schema';
import { NotFoundError, ForbiddenError, InsufficientFundsError } from '../../../shared/utils/errors.util';
import { generateTransactionId } from '../../../shared/utils/id-generator.util';

/**
 * Create a transaction with atomic balance update
 * @throws {NotFoundError} If account not found
 * @throws {ForbiddenError} If account doesn't belong to user
 * @throws {InsufficientFundsError} If insufficient funds for withdrawal
 */
export async function createTransaction(
  prisma: PrismaClient,
  accountNumber: string,
  userId: string,
  data: CreateTransactionRequest
): Promise<Transaction> {
  const { amount, currency, type, reference } = data;
  const transactionAmount = new Decimal(amount.toString());

  // Use Prisma transaction for atomicity
  return await prisma.$transaction(async (tx) => {
    // First, find and verify account ownership
    const account = await tx.bankAccount.findUnique({
      where: { accountNumber },
      include: {
        user: {
          select: { id: true, userId: true },
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

    const currentBalance = new Decimal(account.balance.toString());
    let newBalance: Decimal;

    // Calculate new balance based on transaction type
    if (type === TransactionType.DEPOSIT) {
      newBalance = currentBalance.plus(transactionAmount);
    } else if (type === TransactionType.WITHDRAWAL) {
      newBalance = currentBalance.minus(transactionAmount);
      
      // Check for sufficient funds
      if (newBalance.isNegative()) {
        throw new InsufficientFundsError(
          `Insufficient funds. Current balance: £${currentBalance.toFixed(2)}, Withdrawal amount: £${transactionAmount.toFixed(2)}`
        );
      }
    } else {
      throw new Error('Invalid transaction type');
    }

    // Update account balance
    await tx.bankAccount.update({
      where: { accountNumber },
      data: {
        balance: new Prisma.Decimal(newBalance.toString()),
        updatedTimestamp: new Date(),
      },
    });

    // Create transaction record
    const transactionId = generateTransactionId();
    const now = new Date();

    const transaction = await tx.transaction.create({
      data: {
        transactionId,
        amount: new Prisma.Decimal(transactionAmount.toString()),
        currency,
        type,
        reference: reference || null,
        userId: account.user.userId, // Use customer-facing user ID
        accountNumber,
        createdTimestamp: now,
      },
    });

    // Map to our domain type
    return {
      id: transaction.id,
      transactionId: transaction.transactionId,
      amount: new Decimal(transaction.amount.toString()),
      currency: transaction.currency as Transaction['currency'],
      type: transaction.type as Transaction['type'],
      ...(transaction.reference && { reference: transaction.reference }),
      userId: transaction.userId,
      accountNumber: transaction.accountNumber,
      createdTimestamp: transaction.createdTimestamp,
    };
  });
} 
import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { BankAccount } from '../entities/account';

/**
 * List all bank accounts for a user
 */
export async function listAccounts(
  prisma: PrismaClient,
  userId: string
): Promise<BankAccount[]> {
  // Fetch all accounts for the user
  const accounts = await prisma.bankAccount.findMany({
    where: {
      user: {
        id: userId,
      },
    },
    orderBy: {
      createdTimestamp: 'desc', // Most recent first
    },
  });

  // Map Prisma accounts to our BankAccount type
  return accounts.map(account => ({
    ...account,
    accountType: account.accountType as BankAccount['accountType'],
    currency: account.currency as BankAccount['currency'],
    balance: new Decimal(account.balance.toString()), // Convert Prisma Decimal to decimal.js Decimal
  }));
} 
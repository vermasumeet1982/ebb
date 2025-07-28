import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { CreateBankAccountRequest } from '../schema/account.schema';
import { BankAccount, Currency, SORT_CODE } from '../entities/account';
import { generateAccountNumber } from '@/shared/utils/id-generator.util';

/**
 * Generate a unique account number
 */
async function generateUniqueAccountNumber(prisma: PrismaClient): Promise<string> {
  while (true) {
    const accountNumber = generateAccountNumber();

    // Check if account number already exists
    const existingAccount = await prisma.bankAccount.findUnique({
      where: { accountNumber },
    });

    if (!existingAccount) {
      return accountNumber;
    }
  }
}

/**
 * Create a new bank account for a user
 */
export async function createBankAccount(
  prisma: PrismaClient,
  userId: string,
  data: CreateBankAccountRequest
): Promise<BankAccount> {
  // Generate unique account number
  const accountNumber = await generateUniqueAccountNumber(prisma);

  // Create bank account with initial balance of 0
  const initialBalance = new Decimal(0);

  // Create bank account
  const bankAccount = await prisma.bankAccount.create({
    data: {
      accountNumber,
      sortCode: SORT_CODE,
      name: data.name,
      accountType: data.accountType,
      balance: initialBalance, // Prisma automatically handles Decimal
      currency: Currency.GBP, // Default currency is GBP
      userId,
      createdTimestamp: new Date(),
      updatedTimestamp: new Date(),
    },
  });

  // Cast the Prisma response to our BankAccount type
  // This is safe because we know the data matches our type
  return {
    ...bankAccount,
    accountType: bankAccount.accountType as BankAccount['accountType'],
    currency: bankAccount.currency as BankAccount['currency'],
    balance: new Decimal(bankAccount.balance.toString()), // Convert Prisma Decimal to decimal.js Decimal
  };
} 
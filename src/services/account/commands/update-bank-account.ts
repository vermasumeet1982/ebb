import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { BankAccount } from '../entities/account';
import { UpdateBankAccountRequest } from '../schema/account.schema';
import { NotFoundError, ForbiddenError } from '@/shared/utils/errors.util';

/**
 * Update a bank account
 * @throws {NotFoundError} If account not found
 * @throws {ForbiddenError} If account doesn't belong to user
 */
export async function updateBankAccount(
  prisma: PrismaClient,
  accountNumber: string,
  userId: string,
  data: UpdateBankAccountRequest
): Promise<BankAccount> {
  // First check if account exists and belongs to user
  const existingAccount = await prisma.bankAccount.findUnique({
    where: { accountNumber },
    include: {
      user: {
        select: { id: true },
      },
    },
  });

  // Handle not found
  if (!existingAccount) {
    throw new NotFoundError('Bank account not found');
  }

  // Check authorization
  if (existingAccount.user.id !== userId) {
    throw new ForbiddenError('Not authorized to update this account');
  }

  // Only include fields that were provided in the update
  const updateFields: Record<string, unknown> = {};
  if (data.name !== undefined) updateFields.name = data.name;
  if (data.accountType !== undefined) updateFields.accountType = data.accountType;

  // Only update if there are changes
  if (Object.keys(updateFields).length === 0) {
    // If no fields to update, return existing account
    return {
      ...existingAccount,
      accountType: existingAccount.accountType as BankAccount['accountType'],
      currency: existingAccount.currency as BankAccount['currency'],
      balance: new Decimal(existingAccount.balance.toString()),
    };
  }

  // Update timestamp only if we're making changes
  updateFields.updatedTimestamp = new Date();

  // Perform update
  const updatedAccount = await prisma.bankAccount.update({
    where: { accountNumber },
    data: updateFields,
  });

  // Map to our domain type
  return {
    ...updatedAccount,
    accountType: updatedAccount.accountType as BankAccount['accountType'],
    currency: updatedAccount.currency as BankAccount['currency'],
    balance: new Decimal(updatedAccount.balance.toString()),
  };
} 
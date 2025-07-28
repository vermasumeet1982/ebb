import { BankAccount } from '../entities/account';
import { BankAccountResponse, TransactionResponse } from '../entities/account.dto';
import { Transaction } from '../entities/transaction';

/**
 * Maps internal BankAccount entity to API BankAccountResponse DTO
 */
export function mapAccountToResponse(account: BankAccount): BankAccountResponse {
  return {
    accountNumber: account.accountNumber,
    sortCode: account.sortCode,
    name: account.name,
    accountType: account.accountType,
    balance: Number(account.balance.toFixed(2)), // Convert Decimal to number with 2 decimal places
    currency: account.currency,
    createdTimestamp: account.createdTimestamp.toISOString(),
    updatedTimestamp: account.updatedTimestamp.toISOString(),
  };
}

/**
 * Maps internal Transaction entity to API TransactionResponse DTO
 */
export function mapTransactionToResponse(transaction: Transaction): TransactionResponse {
  return {
    id: transaction.transactionId, // Map internal transactionId to API id
    amount: Number(transaction.amount.toFixed(2)), // Convert Decimal to number with 2 decimal places
    currency: transaction.currency,
    type: transaction.type,
    ...(transaction.reference && { reference: transaction.reference }), // Only include if exists
    userId: transaction.userId, // Customer-facing user ID
    createdTimestamp: transaction.createdTimestamp.toISOString(),
  };
} 
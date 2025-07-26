import {
  BankAccount,
  BankAccountResponse,
  Transaction,
  TransactionResponse,
} from '../entities';

/**
 * Maps internal BankAccount entity to API BankAccountResponse DTO
 */
export function mapAccountToResponse(account: BankAccount): BankAccountResponse {
  return {
    accountNumber: account.accountNumber,
    sortCode: account.sortCode,
    name: account.name,
    accountType: account.accountType,
    balance: account.balance,
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
    amount: transaction.amount,
    currency: transaction.currency,
    type: transaction.type,
    ...(transaction.reference && { reference: transaction.reference }), // Only include if exists
    userId: transaction.userId, // Customer-facing user ID
    createdTimestamp: transaction.createdTimestamp.toISOString(),
  };
} 
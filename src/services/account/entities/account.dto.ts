import { AccountType, Currency } from './account';
import { TransactionType } from './transaction';

// ========== API RESPONSE TYPES ==========

/**
 * Bank Account Response DTO 
 */
export interface BankAccountResponse {
  accountNumber: string; // Maps to BankAccount.accountNumber (01xxxxxx)
  sortCode: string;
  name: string;
  accountType: AccountType;
  balance: number; // OpenAPI spec: type number, format double
  currency: Currency;
  createdTimestamp: string; // ISO string format for API
  updatedTimestamp: string; // ISO string format for API
}

/**
 * List of Bank Accounts Response DTO
 */
export interface ListBankAccountsResponse {
  accounts: BankAccountResponse[];
}

/**
 * Transaction Response DTO
 */
export interface TransactionResponse {
  id: string; // Customer-facing transaction ID (tan-[A-Za-z0-9]+)
  amount: number; // OpenAPI spec: type number, format double
  currency: Currency;
  type: TransactionType;
  reference?: string;
  userId: string; // Customer-facing user ID (usr-[A-Za-z0-9]+)
  createdTimestamp: string;
}

/**
 * List of Transactions Response DTO
 */
export interface ListTransactionsResponse {
  transactions: TransactionResponse[];
} 
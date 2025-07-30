import { AccountType, Currency } from './account';

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


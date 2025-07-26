import { AccountType, Currency } from './account';

// ========== API REQUEST TYPES ==========

export interface CreateBankAccountPayload {
  name: string;
  accountType: AccountType;
  userId: string;
}

export interface UpdateBankAccountPayload {
  name?: string;
  accountType?: AccountType;
}

// ========== API RESPONSE TYPES ==========

/**
 * Bank Account Response DTO 
 */
export interface BankAccountResponse {
  accountNumber: string; // Maps to BankAccount.accountNumber (01xxxxxx)
  sortCode: string;
  name: string;
  accountType: AccountType;
  balance: number;
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
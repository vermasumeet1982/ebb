import { Decimal } from 'decimal.js';

export enum AccountType {
  PERSONAL = 'personal',
}

export enum Currency {
  GBP = 'GBP',
}

export const SORT_CODE = '10-10-10' as const;

export interface BankAccount {
  id: string; // Internal database ID
  accountNumber: string; // Pattern: ^01\d{6}$ - Customer-facing account number
  sortCode: string; // Always "10-10-10"
  name: string;
  accountType: AccountType;
  balance: Decimal; // Using Decimal for precise financial calculations
  currency: Currency;
  userId: string; // Foreign key to User (usr-[A-Za-z0-9]+)
  createdTimestamp: Date;
  updatedTimestamp: Date;
} 
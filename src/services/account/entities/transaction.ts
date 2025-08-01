import { Decimal } from 'decimal.js';
import { Currency } from './account';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export interface Transaction {
  id: string; // Internal database ID
  transactionId: string; // Pattern: ^tan-[A-Za-z0-9]+$ - Customer-facing transaction ID
  amount: Decimal; // Using Decimal for precise financial calculations
  currency: Currency;
  type: TransactionType;
  reference?: string;
  userId: string; // Foreign key to User (usr-[A-Za-z0-9]+)
  accountNumber: string; // Foreign key to BankAccount (01xxxxxx)
  createdTimestamp: Date;
} 
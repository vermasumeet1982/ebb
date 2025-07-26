import { Currency } from './account';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export interface Transaction {
  id: string; // Internal database ID
  transactionId: string; // Pattern: ^tan-[A-Za-z0-9]+$ - Customer-facing transaction ID
  amount: number; // 0.00 to 10000.00
  currency: Currency;
  type: TransactionType;
  reference?: string;
  userId: string; // Foreign key to User (usr-[A-Za-z0-9]+)
  accountNumber: string; // Foreign key to BankAccount (01xxxxxx)
  createdTimestamp: Date;
} 
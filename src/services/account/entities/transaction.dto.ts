import { Currency } from './account';
import { TransactionType } from './transaction';
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
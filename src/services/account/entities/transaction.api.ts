import { TransactionType } from './transaction';
import { Currency } from './account';

// ========== API REQUEST TYPES ==========

export interface CreateTransactionRequest {
  amount: number;
  currency: Currency;
  type: TransactionType;
  reference?: string;
  // userId comes from JWT authentication
  // accountNumber comes from URL path parameter
}

// ========== API RESPONSE TYPES ==========

/**
 * Transaction Response DTO - Maps to OpenAPI specification
 * The API expects 'id' to be the customer-facing transaction ID (tan-xxx pattern)
 */
export interface TransactionResponse {
  id: string; // Maps to Transaction.transactionId (tan-[A-Za-z0-9]+)
  amount: number;
  currency: Currency;
  type: TransactionType;
  reference?: string;
  userId: string; // Maps to Transaction.userId (usr-[A-Za-z0-9]+)
  createdTimestamp: string; // ISO string format for API
}

/**
 * List of Transactions Response DTO
 */
export interface ListTransactionsResponse {
  transactions: TransactionResponse[];
} 
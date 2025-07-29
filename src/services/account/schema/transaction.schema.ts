import { z } from 'zod';
import { TransactionType } from '../entities/transaction';
import { Currency } from '../entities/account';

// Create Transaction Request schema (matches OpenAPI spec)
export const CreateTransactionSchema = z.object({
  amount: z.number()
    .min(0.01, 'Amount must be greater than 0.00')
    .max(10000.00, 'Amount must not exceed 10000.00')
    .refine(
      (val) => Number(val.toFixed(2)) === val,
      'Amount must have at most 2 decimal places'
    ),
  
  currency: z.nativeEnum(Currency, {
    errorMap: () => ({ message: 'Currency must be "GBP"' }),
  }),
  
  type: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: 'Transaction type must be "deposit" or "withdrawal"' }),
  }),
  
  reference: z.string()
    .min(1, 'Reference cannot be empty')
    .max(255, 'Reference must be at most 255 characters')
    .optional(),
}).strict('Unknown fields are not allowed');

// Type exports
export type CreateTransactionRequest = z.infer<typeof CreateTransactionSchema>; 
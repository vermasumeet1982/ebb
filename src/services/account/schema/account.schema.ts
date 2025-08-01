import { z } from 'zod';
import { AccountType } from '../entities/account';

// Create Bank Account Request schema (matches OpenAPI spec)
export const CreateBankAccountSchema = z.object({
  name: z.string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be at most 100 characters')
    .regex(/^(?!\s*$).+/, 'Account name cannot be empty or contain only whitespace'),
  
  accountType: z.nativeEnum(AccountType, {
    errorMap: () => ({ message: 'Account type must be "personal"' }),
  }),
}).strict('Unknown fields are not allowed');

// Type exports
export type CreateBankAccountRequest = z.infer<typeof CreateBankAccountSchema>;

// Update Bank Account Request schema (matches OpenAPI spec)
export const UpdateBankAccountSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .regex(/^(?!\s*$).+/, 'Name cannot be empty or contain only whitespace')
    .optional(),
  accountType: z.nativeEnum(AccountType)
    .optional(),
}).strict('Unknown fields are not allowed');

export type UpdateBankAccountRequest = z.infer<typeof UpdateBankAccountSchema>; 
import { z } from 'zod';

/**
 * Schema for login request validation
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * Type for login request
 */
export type LoginRequest = z.infer<typeof LoginSchema>;

/**
 * Type for login response
 */
export interface LoginResponse {
  accessToken: string;
} 
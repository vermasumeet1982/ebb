import { z } from 'zod';

// Address schema (matches OpenAPI spec)
export const AddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  line3: z.string().optional(),
  town: z.string().min(1, 'Town is required'),
  county: z.string().min(1, 'County is required'),
  postcode: z.string().min(1, 'Postcode is required'),
});

// Create User Request schema (matches OpenAPI spec + password)
export const CreateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  
  email: z.string()
    .email('Invalid email format'),
  
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in international format (+1234567890)'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/,
      'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&)'
    ),
  
  address: AddressSchema,
});

// Type exports
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type Address = z.infer<typeof AddressSchema>; 
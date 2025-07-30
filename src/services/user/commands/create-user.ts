import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { CreateUserRequest } from '../schema/user.schema';
import { generateUserId } from '@/shared/utils/id-generator.util';
import { ConflictError } from '@/shared/utils/error.utils';

/**
 * Create a new user in the system
 */
export async function createUser(
  prisma: PrismaClient,
  data: CreateUserRequest
): Promise<{
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  address: unknown;
  createdTimestamp: Date;
  updatedTimestamp: Date;
}> {
  // 1. Validate email and phone uniqueness
  await validateUniqueness(prisma, data.email, data.phoneNumber);
  
  // 2. Hash the password
  const passwordHash = await hashPassword(data.password);
  
  // 3. Generate customer-facing user ID
  const userId = generateUserId(); // usr-abc123def456
  
  // 4. Create user in database
  const user = await prisma.user.create({
    data: {
      userId,
      name: data.name,
      email: data.email.toLowerCase(), // Normalize email
      phoneNumber: data.phoneNumber,
      password: passwordHash,
      address: data.address,
    },
  });

  return user;
}

/**
 * Validate that email and phone number are unique
 */
async function validateUniqueness(
  prisma: PrismaClient,
  email: string,
  phoneNumber: string
): Promise<void> {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { phoneNumber },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw new ConflictError('A user with this email already exists');
    }
    if (existingUser.phoneNumber === phoneNumber) {
      throw new ConflictError('A user with this phone number already exists');
    }
  }
}

/**
 * Hash password using bcrypt with high security settings
 */
async function hashPassword(password: string): Promise<string> {
  const SALT_ROUNDS = 12; // High security for banking application
  return await bcrypt.hash(password, SALT_ROUNDS);
} 
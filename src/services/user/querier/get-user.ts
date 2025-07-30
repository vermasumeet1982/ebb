import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '@/shared/utils/error.utils';

/**
 * Get user by userId (customer-facing ID)
 */
export async function getUser(
  prisma: PrismaClient,
  userId: string
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
  // Validate userId parameter
  if (!userId || userId.trim() === '') {
    throw new ValidationError('User ID is required');
  }

  // Find user by userId (customer-facing ID)
  const user = await prisma.user.findUnique({
    where: {
      userId: userId,
    },
  });

  // Check if user exists
  if (!user) {
    throw new NotFoundError('User was not found');
  }

  return user;
} 
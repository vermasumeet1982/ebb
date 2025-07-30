import { PrismaClient } from '@prisma/client';
import { UpdateUserRequest } from '../schema/user.schema';
import { NotFoundError, ConflictError } from '@/shared/utils/error.utils';

/**
 * Update user by userId (customer-facing ID)
 */
export async function updateUser(
  prisma: PrismaClient,
  userId: string,
  updateData: UpdateUserRequest
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
    throw new NotFoundError('User ID is required');
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!existingUser) {
    throw new NotFoundError('User was not found');
  }

  // Prepare update data (only include fields that are provided)
  const updateFields: any = {};
  let hasChanges = false;

  if (updateData.name !== undefined) {
    if (updateData.name !== existingUser.name) {
      updateFields.name = updateData.name;
      hasChanges = true;
    }
  }

  if (updateData.email !== undefined) {
    const newEmail = updateData.email.toLowerCase();
    if (newEmail !== existingUser.email) {
      // Check if new email already exists
      const emailExists = await prisma.user.findUnique({
        where: {
          email: newEmail,
        },
      });

      if (emailExists) {
        throw new ConflictError('Email already exists');
      }
      
      updateFields.email = newEmail;
      hasChanges = true;
    }
  }

  if (updateData.phoneNumber !== undefined) {
    if (updateData.phoneNumber !== existingUser.phoneNumber) {
      // Check if new phone number already exists
      const phoneExists = await prisma.user.findUnique({
        where: {
          phoneNumber: updateData.phoneNumber,
        },
      });

      if (phoneExists) {
        throw new ConflictError('Phone number already exists');
      }
      
      updateFields.phoneNumber = updateData.phoneNumber;
      hasChanges = true;
    }
  }

  if (updateData.address !== undefined) {
    // Deep comparison for address object
    const existingAddress = existingUser.address as any;
    const newAddress = updateData.address;
    
    if (JSON.stringify(existingAddress) !== JSON.stringify(newAddress)) {
      updateFields.address = newAddress;
      hasChanges = true;
    }
  }

  // Only update timestamp if there are actual changes
  if (hasChanges) {
    updateFields.updatedTimestamp = new Date();
  }

  // If no changes, return existing user without database update
  if (!hasChanges) {
    return existingUser;
  }

  // Update user in database
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId,
    },
    data: updateFields,
  });

  return updatedUser;
} 
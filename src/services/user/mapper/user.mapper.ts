import { User, UserResponse } from '../entities';
import { Address as ApiAddress } from '../schema/user.schema';


// Prisma User interface (matches database schema)
interface PrismaUserData {
  id: string;
  userId: string;
  name: string;
  address: unknown;
  phoneNumber: string;
  email: string;
  createdTimestamp: Date;
  updatedTimestamp: Date;
}

/**
 * Converts Prisma User to our User interface
 */
export function mapPrismaUserToUser(prismaUser: PrismaUserData): User {
  return {
    id: prismaUser.id,
    userId: prismaUser.userId,
    name: prismaUser.name,
    address: prismaUser.address as User['address'],
    phoneNumber: prismaUser.phoneNumber,
    email: prismaUser.email,
    createdTimestamp: prismaUser.createdTimestamp,
    updatedTimestamp: prismaUser.updatedTimestamp,
  };
}

/**
 * Maps internal User entity to API UserResponse DTO
 */
export function mapUserToResponse(user: User): UserResponse {
  return {
    id: user.userId, // Map internal userId to API id
    name: user.name,
    address: user.address as ApiAddress, // Type assertion since they're compatible
    phoneNumber: user.phoneNumber,
    email: user.email,
    createdTimestamp: user.createdTimestamp.toISOString(),
    updatedTimestamp: user.updatedTimestamp.toISOString(),
  };
} 
import { User } from '../entities';
import { Address as ApiAddress } from '../schema/user.schema';

// API Response DTO (separate from database entity)
export interface UserResponse {
  id: string; // Maps to User.userId (usr-[A-Za-z0-9]+)
  name: string;
  address: ApiAddress;
  phoneNumber: string;
  email: string;
  createdTimestamp: string; // ISO string format for API
  updatedTimestamp: string; // ISO string format for API
}

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
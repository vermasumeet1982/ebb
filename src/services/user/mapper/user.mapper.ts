import { User, UserResponse } from '../entities';

/**
 * Maps internal User entity to API UserResponse DTO
 */
export function mapUserToResponse(user: User): UserResponse {
  return {
    id: user.userId, // Map internal userId to API id
    name: user.name,
    address: user.address,
    phoneNumber: user.phoneNumber,
    email: user.email,
    createdTimestamp: user.createdTimestamp.toISOString(),
    updatedTimestamp: user.updatedTimestamp.toISOString(),
  };
} 
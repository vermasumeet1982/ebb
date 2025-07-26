import { Address } from './user';

// ========== API REQUEST TYPES ==========

export interface CreateUserRequest {
  name: string;
  address: Address;
  phoneNumber: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  address?: Address;
  phoneNumber?: string;
  email?: string;
}

// ========== API RESPONSE TYPES ==========

/**
 * User Response DTO - Maps to OpenAPI specification
 * The API expects 'id' to be the customer-facing user ID (usr-xxx pattern)
 */
export interface UserResponse {
  id: string; // Maps to User.userId (usr-[A-Za-z0-9]+)
  name: string;
  address: Address;
  phoneNumber: string;
  email: string;
  createdTimestamp: string; // ISO string format for API
  updatedTimestamp: string; // ISO string format for API
} 
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
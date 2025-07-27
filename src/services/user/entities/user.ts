// Database entity types (separate from API schemas)
export interface Address {
  line1: string;
  line2?: string;
  line3?: string;
  town: string;
  county: string;
  postcode: string;
}

export interface User {
  id: string; // Internal database ID
  userId: string; // Pattern: usr-[A-Za-z0-9]+ - Customer-facing user ID
  name: string;
  address: Address;
  phoneNumber: string; // Pattern: ^\+[1-9]\d{1,14}$
  email: string; // Email format
  createdTimestamp: Date;
  updatedTimestamp: Date;
} 
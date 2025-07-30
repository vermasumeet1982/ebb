import { PrismaClient } from '@prisma/client';
import { createUser } from '../create-user';
import { CreateUserRequest } from '../../schema/user.schema';
import { ConflictError } from '../../../../shared/utils/error.utils';

// Mock Prisma client
const mockPrisma = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
} as unknown as PrismaClient;

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
}));

// Mock ID generator
jest.mock('@/shared/utils/id-generator.utils', () => ({
  generateUserId: jest.fn().mockReturnValue('usr-abc123def456'),
}));

describe('createUser', () => {
  const mockCreateUserRequest: CreateUserRequest = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+447700900123',
    password: 'SecurePass123!',
    address: {
      line1: '123 Main Street',
      line2: 'Apt 4B',
      town: 'London',
      county: 'Greater London',
      postcode: 'SW1A 1AA',
    },
  };

  const mockCreatedUser = {
    id: 'internal-uuid-123',
    userId: 'usr-abc123def456',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+447700900123',
    password: 'hashedPassword123',
    address: {
      line1: '123 Main Street',
      line2: 'Apt 4B',
      town: 'London',
      county: 'Greater London',
      postcode: 'SW1A 1AA',
    },
    createdTimestamp: new Date('2024-01-15T10:30:00.000Z'),
    updatedTimestamp: new Date('2024-01-15T10:30:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should create a user successfully with all required fields', async () => {
      // Mock database responses
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null); // No existing user
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await createUser(mockPrisma, mockCreateUserRequest);

      // Verify uniqueness check was called
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'john.doe@example.com' },
            { phoneNumber: '+447700900123' },
          ],
        },
      });

      // Verify user creation was called with correct data
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          userId: 'usr-abc123def456',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+447700900123',
          password: 'hashedPassword123',
          address: {
            line1: '123 Main Street',
            line2: 'Apt 4B',
            town: 'London',
            county: 'Greater London',
            postcode: 'SW1A 1AA',
          },
        },
      });

      // Verify returned user data
      expect(result).toEqual(mockCreatedUser);
    });

    it('should create a user with minimal address fields', async () => {
      const minimalAddressRequest: CreateUserRequest = {
        ...mockCreateUserRequest,
        address: {
          line1: '456 Oak Street',
          town: 'Manchester',
          county: 'Greater Manchester',
          postcode: 'M1 1AA',
        },
      };

      const minimalAddressUser = {
        ...mockCreatedUser,
        address: {
          line1: '456 Oak Street',
          town: 'Manchester',
          county: 'Greater Manchester',
          postcode: 'M1 1AA',
        },
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(minimalAddressUser);

      const result = await createUser(mockPrisma, minimalAddressRequest);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          userId: 'usr-abc123def456',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+447700900123',
          password: 'hashedPassword123',
          address: {
            line1: '456 Oak Street',
            town: 'Manchester',
            county: 'Greater Manchester',
            postcode: 'M1 1AA',
          },
        },
      });

      expect(result).toEqual(minimalAddressUser);
    });

    it('should normalize email to lowercase', async () => {
      const requestWithUppercaseEmail: CreateUserRequest = {
        ...mockCreateUserRequest,
        email: 'JOHN.DOE@EXAMPLE.COM',
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      await createUser(mockPrisma, requestWithUppercaseEmail);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'john.doe@example.com', // Should be normalized to lowercase
        }),
      });
    });

    it('should check uniqueness with normalized email', async () => {
      const requestWithUppercaseEmail: CreateUserRequest = {
        ...mockCreateUserRequest,
        email: 'JOHN.DOE@EXAMPLE.COM',
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      await createUser(mockPrisma, requestWithUppercaseEmail);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'john.doe@example.com' }, // Should check with normalized email
            { phoneNumber: '+447700900123' },
          ],
        },
      });
    });
  });

  describe('Uniqueness validation', () => {
    it('should throw ConflictError when email already exists', async () => {
      const existingUser = {
        id: 'existing-uuid',
        userId: 'usr-existing123',
        email: 'john.doe@example.com',
        phoneNumber: '+447700900999',
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(existingUser);

      await expect(createUser(mockPrisma, mockCreateUserRequest)).rejects.toThrow(
        ConflictError
      );
      await expect(createUser(mockPrisma, mockCreateUserRequest)).rejects.toThrow(
        'A user with this email already exists'
      );

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when phone number already exists', async () => {
      const existingUser = {
        id: 'existing-uuid',
        userId: 'usr-existing123',
        email: 'different@example.com',
        phoneNumber: '+447700900123',
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(existingUser);

      await expect(createUser(mockPrisma, mockCreateUserRequest)).rejects.toThrow(
        ConflictError
      );
      await expect(createUser(mockPrisma, mockCreateUserRequest)).rejects.toThrow(
        'A user with this phone number already exists'
      );

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when both email and phone already exist', async () => {
      const existingUser = {
        id: 'existing-uuid',
        userId: 'usr-existing123',
        email: 'john.doe@example.com',
        phoneNumber: '+447700900123',
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(existingUser);

      await expect(createUser(mockPrisma, mockCreateUserRequest)).rejects.toThrow(
        ConflictError
      );
      await expect(createUser(mockPrisma, mockCreateUserRequest)).rejects.toThrow(
        'A user with this email already exists'
      );

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('Password hashing', () => {
    it('should hash the password before storing', async () => {
      const bcrypt = require('bcryptjs');
      
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      await createUser(mockPrisma, mockCreateUserRequest);

      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: 'hashedPassword123',
        }),
      });
    });

    it('should use 12 salt rounds for high security', async () => {
      const bcrypt = require('bcryptjs');
      
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      await createUser(mockPrisma, mockCreateUserRequest);

      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 12);
    });
  });

  describe('ID generation', () => {
    it('should generate a unique userId for each user', async () => {
      const { generateUserId } = require('@/shared/utils/id-generator.utils');
      
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      await createUser(mockPrisma, mockCreateUserRequest);

      expect(generateUserId).toHaveBeenCalled();
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'usr-abc123def456',
        }),
      });
    });
  });

  describe('Database errors', () => {
    it('should propagate database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      (mockPrisma.user.findFirst as jest.Mock).mockRejectedValue(dbError);

      await expect(createUser(mockPrisma, mockCreateUserRequest)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should propagate database creation errors', async () => {
      const dbError = new Error('Unique constraint violation');
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockRejectedValue(dbError);

      await expect(createUser(mockPrisma, mockCreateUserRequest)).rejects.toThrow(
        'Unique constraint violation'
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in name', async () => {
      const requestWithSpecialName: CreateUserRequest = {
        ...mockCreateUserRequest,
        name: 'Dr. Jane Smith-Jones',
      };

      const userWithSpecialName = {
        ...mockCreatedUser,
        name: 'Dr. Jane Smith-Jones',
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(userWithSpecialName);

      const result = await createUser(mockPrisma, requestWithSpecialName);

      expect(result.name).toBe('Dr. Jane Smith-Jones');
    });

    it('should handle international phone numbers', async () => {
      const requestWithInternationalPhone: CreateUserRequest = {
        ...mockCreateUserRequest,
        phoneNumber: '+1234567890',
      };

      const userWithInternationalPhone = {
        ...mockCreatedUser,
        phoneNumber: '+1234567890',
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(userWithInternationalPhone);

      const result = await createUser(mockPrisma, requestWithInternationalPhone);

      expect(result.phoneNumber).toBe('+1234567890');
    });

    it('should handle complex address structures', async () => {
      const requestWithComplexAddress: CreateUserRequest = {
        ...mockCreateUserRequest,
        address: {
          line1: '789 Business Park',
          line2: 'Building A, Suite 100',
          line3: 'Floor 5, East Wing',
          town: 'Birmingham',
          county: 'West Midlands',
          postcode: 'B1 1AA',
        },
      };

      const userWithComplexAddress = {
        ...mockCreatedUser,
        address: {
          line1: '789 Business Park',
          line2: 'Building A, Suite 100',
          line3: 'Floor 5, East Wing',
          town: 'Birmingham',
          county: 'West Midlands',
          postcode: 'B1 1AA',
        },
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(userWithComplexAddress);

      const result = await createUser(mockPrisma, requestWithComplexAddress);

      // Type assertion for address field
      const address = result.address as {
        line1: string;
        line2: string;
        line3: string;
        town: string;
        county: string;
        postcode: string;
      };

      expect(address.line1).toBe('789 Business Park');
      expect(address.line2).toBe('Building A, Suite 100');
      expect(address.line3).toBe('Floor 5, East Wing');
    });
  });
}); 
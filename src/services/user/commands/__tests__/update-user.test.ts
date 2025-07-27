import { PrismaClient } from '@prisma/client';
import { updateUser } from '../update-user';
import { UpdateUserRequest } from '../../schema/user.schema';
import { NotFoundError, ConflictError } from '../../../../shared/utils/errors.util';

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

describe('updateUser', () => {
  let mockExistingUser: {
    id: string;
    userId: string;
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    address: unknown;
    createdTimestamp: Date;
    updatedTimestamp: Date;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock existing user data
    mockExistingUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'usr-abc123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      password: 'hashedPassword123',
      address: {
        line1: '123 Main St',
        town: 'Anytown',
        county: 'Anycounty',
        postcode: '12345',
      },
      createdTimestamp: new Date('2024-01-01T00:00:00Z'),
      updatedTimestamp: new Date('2024-01-01T00:00:00Z'),
    };
  });

  describe('Parameter validation', () => {
    it.each([
      { userId: null as unknown as string, description: 'null userId' },
      { userId: undefined as unknown as string, description: 'undefined userId' },
      { userId: '', description: 'empty userId' },
      { userId: '   ', description: 'whitespace-only userId' },
    ])('should throw NotFoundError for $description', async ({ userId }) => {
      // Arrange
      const updateData: UpdateUserRequest = { name: 'New Name' };

      // Act & Assert
      await expect(updateUser(mockPrisma, userId, updateData)).rejects.toThrow(NotFoundError);
      await expect(updateUser(mockPrisma, userId, updateData)).rejects.toThrow('User ID is required');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('User existence validation', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = 'usr-nonexistent';
      const updateData: UpdateUserRequest = { name: 'New Name' };
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(updateUser(mockPrisma, userId, updateData)).rejects.toThrow(NotFoundError);
      await expect(updateUser(mockPrisma, userId, updateData)).rejects.toThrow('User was not found');
      
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
      });
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('Success cases', () => {
    it('should update user name successfully', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const updateData: UpdateUserRequest = { name: 'Jane Smith' };
      const updatedUser = { ...mockExistingUser, name: 'Jane Smith' };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act
      const result = await updateUser(mockPrisma, userId, updateData);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
        data: {
          name: 'Jane Smith',
          updatedTimestamp: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update user email successfully', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const updateData: UpdateUserRequest = { email: 'jane.smith@example.com' };
      const updatedUser = { ...mockExistingUser, email: 'jane.smith@example.com' };

      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockExistingUser) // First call for user existence
        .mockResolvedValueOnce(null); // Second call for email uniqueness (no conflict)
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act
      const result = await updateUser(mockPrisma, userId, updateData);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
        data: {
          email: 'jane.smith@example.com',
          updatedTimestamp: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update user phone number successfully', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const updateData: UpdateUserRequest = { phoneNumber: '+9876543210' };
      const updatedUser = { ...mockExistingUser, phoneNumber: '+9876543210' };

      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockExistingUser) // First call for user existence
        .mockResolvedValueOnce(null); // Second call for phone uniqueness (no conflict)
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act
      const result = await updateUser(mockPrisma, userId, updateData);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
        data: {
          phoneNumber: '+9876543210',
          updatedTimestamp: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update user address successfully', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const newAddress = {
        line1: '456 Oak Street',
        line2: 'Apt 7B',
        town: 'Newtown',
        county: 'Newcounty',
        postcode: '67890',
      };
      const updateData: UpdateUserRequest = { address: newAddress };
      const updatedUser = { ...mockExistingUser, address: newAddress };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act
      const result = await updateUser(mockPrisma, userId, updateData);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
        data: {
          address: newAddress,
          updatedTimestamp: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update multiple fields successfully', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const updateData: UpdateUserRequest = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '+9876543210',
      };
      const updatedUser = {
        ...mockExistingUser,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '+9876543210',
      };

      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockExistingUser) // First call for user existence
        .mockResolvedValueOnce(null) // Second call for email uniqueness (no conflict)
        .mockResolvedValueOnce(null); // Third call for phone uniqueness (no conflict)
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act
      const result = await updateUser(mockPrisma, userId, updateData);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
        data: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phoneNumber: '+9876543210',
          updatedTimestamp: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle empty update data (no changes)', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const updateData: UpdateUserRequest = {};

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);

      // Act
      const result = await updateUser(mockPrisma, userId, updateData);

      // Assert
      expect(mockPrisma.user.update).not.toHaveBeenCalled(); // No database update
      expect(result).toEqual(mockExistingUser); // Returns existing user unchanged
    });
  });

  describe('Uniqueness validation', () => {
    it('should throw ConflictError when email already exists', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const updateData: UpdateUserRequest = { email: 'existing@example.com' };
      const existingUserWithEmail = { ...mockExistingUser, userId: 'usr-other123' };

      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockExistingUser) // First call for user existence
        .mockResolvedValueOnce(existingUserWithEmail); // Second call for email uniqueness

      // Act & Assert
      await expect(updateUser(mockPrisma, userId, updateData)).rejects.toThrow(ConflictError);
      await expect(updateUser(mockPrisma, userId, updateData)).rejects.toThrow('Email already exists');
    });

    it('should throw ConflictError when phone number already exists', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const updateData: UpdateUserRequest = { phoneNumber: '+9876543210' };
      const existingUserWithPhone = { ...mockExistingUser, userId: 'usr-other123' };

      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockExistingUser) // First call for user existence
        .mockResolvedValueOnce(existingUserWithPhone); // Second call for phone uniqueness

      // Act & Assert
      await expect(updateUser(mockPrisma, userId, updateData)).rejects.toThrow(ConflictError);
      await expect(updateUser(mockPrisma, userId, updateData)).rejects.toThrow('Phone number already exists');
    });
  });

  describe('Allow updating to same values (no change)', () => {
    it.each([
      {
        updateData: { email: 'john.doe@example.com' } as UpdateUserRequest,
        description: 'same email',
      },
      {
        updateData: { phoneNumber: '+1234567890' } as UpdateUserRequest,
        description: 'same phone number',
      },
      {
        updateData: {
          address: {
            line1: '123 Main St',
            town: 'Anytown',
            county: 'Anycounty',
            postcode: '12345',
          },
        } as UpdateUserRequest,
        description: 'same address',
      },
    ])('should allow updating to $description (no change)', async ({ updateData }) => {
      // Arrange
      const userId = 'usr-abc123';
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);

      // Act
      const result = await updateUser(mockPrisma, userId, updateData);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1); // Only for user existence
      expect(mockPrisma.user.update).not.toHaveBeenCalled(); // No database update
      expect(result).toEqual(mockExistingUser); // Returns existing user unchanged
    });
  });

  describe('Database interaction', () => {
    it('should call update with correct parameters', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const updateData: UpdateUserRequest = { name: 'Jane Smith' };
      const updatedUser = { ...mockExistingUser, name: 'Jane Smith' };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act
      await updateUser(mockPrisma, userId, updateData);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
        data: {
          name: 'Jane Smith',
          updatedTimestamp: expect.any(Date),
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const updateData: UpdateUserRequest = { name: 'Jane Smith' };
      const dbError = new Error('Database connection failed');

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);
      (mockPrisma.user.update as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(updateUser(mockPrisma, userId, updateData)).rejects.toThrow('Database connection failed');
    });
  });
}); 
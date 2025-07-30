import { PrismaClient } from '@prisma/client';
import { getUser } from '../get-user';
import { NotFoundError, ValidationError } from '../../../../shared/utils/error.utils';

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient;

describe('getUser', () => {
  let mockUser: {
    id: string;
    userId: string;
    name: string;
    address: unknown;
    phoneNumber: string;
    email: string;
    createdTimestamp: Date;
    updatedTimestamp: Date;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock user data
    mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'usr-abc123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
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
    it('should throw ValidationError for null userId', async () => {
      // Arrange
      const userId = null as unknown as string;

      // Act & Assert
      await expect(getUser(mockPrisma, userId)).rejects.toThrow(ValidationError);
      await expect(getUser(mockPrisma, userId)).rejects.toThrow('User ID is required');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for undefined userId', async () => {
      // Arrange
      const userId = undefined as unknown as string;

      // Act & Assert
      await expect(getUser(mockPrisma, userId)).rejects.toThrow(ValidationError);
      await expect(getUser(mockPrisma, userId)).rejects.toThrow('User ID is required');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for empty userId', async () => {
      // Arrange
      const userId = '';

      // Act & Assert
      await expect(getUser(mockPrisma, userId)).rejects.toThrow(ValidationError);
      await expect(getUser(mockPrisma, userId)).rejects.toThrow('User ID is required');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for whitespace-only userId', async () => {
      // Arrange
      const userId = '   ';

      // Act & Assert
      await expect(getUser(mockPrisma, userId)).rejects.toThrow(ValidationError);
      await expect(getUser(mockPrisma, userId)).rejects.toThrow('User ID is required');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('Success cases', () => {
    it('should successfully get user by userId', async () => {
      // Arrange
      const userId = 'usr-abc123';
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await getUser(mockPrisma, userId);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
      });
      expect(result).toEqual(mockUser);
    });

  });

  describe('Error cases', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = 'usr-nonexistent';
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(getUser(mockPrisma, userId)).rejects.toThrow(NotFoundError);
      await expect(getUser(mockPrisma, userId)).rejects.toThrow('User was not found');
      
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const dbError = new Error('Database connection failed');
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(getUser(mockPrisma, userId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long userId', async () => {
      // Arrange
      const userId = 'usr-' + 'a'.repeat(100);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        userId,
      });

      // Act
      const result = await getUser(mockPrisma, userId);

      // Assert
      expect(result.userId).toBe(userId);
    });

    it('should handle special characters in userId', async () => {
      // Arrange
      const userId = 'usr-abc123!@#$%^&*()';
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        userId,
      });

      // Act
      const result = await getUser(mockPrisma, userId);

      // Assert
      expect(result.userId).toBe(userId);
    });
  });

  describe('Database interaction', () => {
    it('should call findUnique with correct parameters', async () => {
      // Arrange
      const userId = 'usr-abc123';
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await getUser(mockPrisma, userId);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: userId,
        },
      });
    });

    it('should return the exact user data from database', async () => {
      // Arrange
      const userId = 'usr-abc123';
      const customUser = {
        ...mockUser,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '+9876543210',
      };
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(customUser);

      // Act
      const result = await getUser(mockPrisma, userId);

      // Assert
      expect(result).toEqual(customUser);
      expect(result.name).toBe('Jane Smith');
      expect(result.email).toBe('jane.smith@example.com');
      expect(result.phoneNumber).toBe('+9876543210');
    });
  });
}); 
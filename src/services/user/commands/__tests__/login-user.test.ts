import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { loginUser } from '../login-user';
import { LoginRequest } from '../../schema/auth.schema';
import { UnauthorizedError } from '../../../../shared/utils/errors.util';

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient;

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

// Mock UnauthorizedError
jest.mock('@/shared/utils/errors.util', () => ({
  UnauthorizedError: jest.fn(),
}));

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockUnauthorizedError = UnauthorizedError as jest.MockedClass<typeof UnauthorizedError>;

describe('loginUser', () => {
  let mockUser: {
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
    
    // Mock user data
    mockUser = {
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

    // Mock environment variable
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('Success cases', () => {
    it('should successfully login user with valid credentials', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'MySecure@Pass1',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      const result = await loginUser(mockPrisma, loginData);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'john.doe@example.com',
        },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('MySecure@Pass1', 'hashedPassword123');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: 'usr-abc123',
          email: 'john.doe@example.com',
          iat: expect.any(Number),
          exp: expect.any(Number),
        },
        'test-jwt-secret',
        { algorithm: 'HS256' }
      );
      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
    });

    it('should handle email case-insensitively', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'JOHN.DOE@EXAMPLE.COM',
        password: 'MySecure@Pass1',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      const result = await loginUser(mockPrisma, loginData);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'john.doe@example.com',
        },
      });
      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
    });

    it('should generate JWT token with correct expiration time', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'MySecure@Pass1',
      };

      const mockDate = new Date('2024-01-01T12:00:00Z');
      jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      await loginUser(mockPrisma, loginData);

      // Assert
      const expectedIat = Math.floor(mockDate.getTime() / 1000);
      const expectedExp = expectedIat + (60 * 60); // 1 hour

      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: 'usr-abc123',
          email: 'john.doe@example.com',
          iat: expectedIat,
          exp: expectedExp,
        },
        'test-jwt-secret',
        { algorithm: 'HS256' }
      );
    });
  });

  describe('Authentication failures', () => {
    it('should throw UnauthorizedError when user does not exist', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'nonexistent@example.com',
        password: 'MySecure@Pass1',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      mockUnauthorizedError.mockImplementation((message: string) => new Error(message) as UnauthorizedError);

      // Act & Assert
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('Invalid email or password');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'nonexistent@example.com',
        },
      });
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when password is incorrect', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'WrongPassword123',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockUnauthorizedError.mockImplementation((message: string) => new Error(message) as UnauthorizedError);

      // Act & Assert
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('Invalid email or password');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'john.doe@example.com',
        },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('WrongPassword123', 'hashedPassword123');
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });

    it('should use same error message for both user not found and invalid password', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'MySecure@Pass1',
      };

      mockUnauthorizedError.mockImplementation((message: string) => new Error(message) as UnauthorizedError);

      // Test user not found
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('Invalid email or password');

      // Test invalid password
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('JWT token generation', () => {
    it('should throw error when JWT_SECRET is not set', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'MySecure@Pass1',
      };

      delete process.env.JWT_SECRET;

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('JWT_SECRET environment variable is not set');
    });

    it('should use HS256 algorithm for JWT signing', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'MySecure@Pass1',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      await loginUser(mockPrisma, loginData);

      // Assert
      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'test-jwt-secret',
        { algorithm: 'HS256' }
      );
    });

    it('should include correct payload in JWT token', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'MySecure@Pass1',
      };

      const mockDate = new Date('2024-01-01T12:00:00Z');
      jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      await loginUser(mockPrisma, loginData);

      // Assert
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: 'usr-abc123',
          email: 'john.doe@example.com',
          iat: Math.floor(mockDate.getTime() / 1000),
          exp: Math.floor(mockDate.getTime() / 1000) + (60 * 60),
        },
        'test-jwt-secret',
        { algorithm: 'HS256' }
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle empty email', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: '',
        password: 'MySecure@Pass1',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      mockUnauthorizedError.mockImplementation((message: string) => new Error(message) as UnauthorizedError);

      // Act & Assert
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('Invalid email or password');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: '',
        },
      });
    });

    it('should handle empty password', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: '',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockUnauthorizedError.mockImplementation((message: string) => new Error(message) as UnauthorizedError);

      // Act & Assert
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('Invalid email or password');
      expect(mockBcrypt.compare).toHaveBeenCalledWith('', 'hashedPassword123');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'MySecure@Pass1',
      };

      const dbError = new Error('Database connection failed');
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('Database connection failed');
    });

    it('should handle bcrypt errors gracefully', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'MySecure@Pass1',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const bcryptError = new Error('Bcrypt comparison failed');
      (mockBcrypt.compare as jest.Mock).mockRejectedValue(bcryptError);

      // Act & Assert
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('Bcrypt comparison failed');
    });

    it('should handle JWT signing errors gracefully', async () => {
      // Arrange
      const loginData: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'MySecure@Pass1',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      const jwtError = new Error('JWT signing failed');
      (mockJwt.sign as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      await expect(loginUser(mockPrisma, loginData)).rejects.toThrow('JWT signing failed');
    });
  });

}); 
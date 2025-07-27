import { Request, Response, NextFunction } from 'express';
import { authorizeUserAccess } from '../authorization.middleware';
import { ForbiddenError } from '../../utils/errors.util';

// Mock Express types
const mockRequest = (user?: { userId: string; email: string }, params?: { userId?: string }) => {
  return {
    user,
    params: params || {},
  } as unknown as Request;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('authorizeUserAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should allow access when user ID matches requested user ID', () => {
      // Arrange
      const req = mockRequest(
        { userId: 'usr-abc123', email: 'john@example.com' },
        { userId: 'usr-abc123' }
      );
      const res = mockResponse();

      // Act
      authorizeUserAccess(req, res, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access for different users with matching IDs', () => {
      // Arrange
      const req = mockRequest(
        { userId: 'usr-def456', email: 'jane@example.com' },
        { userId: 'usr-def456' }
      );
      const res = mockResponse();

      // Act
      authorizeUserAccess(req, res, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('Failure cases', () => {
    it('should throw ForbiddenError when user is not authenticated', () => {
      // Arrange
      const req = mockRequest(undefined, { userId: 'usr-abc123' });
      const res = mockResponse();

      // Act & Assert
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow(ForbiddenError);
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow('User authentication required');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when userId parameter is missing', () => {
      // Arrange
      const req = mockRequest(
        { userId: 'usr-abc123', email: 'john@example.com' },
        {}
      );
      const res = mockResponse();

      // Act & Assert
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow(ForbiddenError);
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow('User ID parameter is required');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when userId parameter is undefined', () => {
      // Arrange
      const req = mockRequest(
        { userId: 'usr-abc123', email: 'john@example.com' },
        { userId: undefined as unknown as string }
      );
      const res = mockResponse();

      // Act & Assert
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow(ForbiddenError);
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow('User ID parameter is required');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user tries to access another user\'s data', () => {
      // Arrange
      const req = mockRequest(
        { userId: 'usr-abc123', email: 'john@example.com' },
        { userId: 'usr-def456' }
      );
      const res = mockResponse();

      // Act & Assert
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow(ForbiddenError);
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow('Access denied: You can only access your own data');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user tries to access different user\'s data', () => {
      // Arrange
      const req = mockRequest(
        { userId: 'usr-def456', email: 'jane@example.com' },
        { userId: 'usr-abc123' }
      );
      const res = mockResponse();

      // Act & Assert
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow(ForbiddenError);
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow('Access denied: You can only access your own data');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string userId parameter', () => {
      // Arrange
      const req = mockRequest(
        { userId: 'usr-abc123', email: 'john@example.com' },
        { userId: '' }
      );
      const res = mockResponse();

      // Act & Assert
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow(ForbiddenError);
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow('User ID parameter is required');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only userId parameter', () => {
      // Arrange
      const req = mockRequest(
        { userId: 'usr-abc123', email: 'john@example.com' },
        { userId: '   ' }
      );
      const res = mockResponse();

      // Act & Assert
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow(ForbiddenError);
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow('User ID parameter is required');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle case-sensitive comparison', () => {
      // Arrange
      const req = mockRequest(
        { userId: 'usr-ABC123', email: 'john@example.com' },
        { userId: 'usr-abc123' }
      );
      const res = mockResponse();

      // Act & Assert
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow(ForbiddenError);
      expect(() => authorizeUserAccess(req, res, mockNext)).toThrow('Access denied: You can only access your own data');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 
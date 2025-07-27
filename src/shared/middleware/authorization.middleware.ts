import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.util';

/**
 * Authorization middleware to ensure users can only access their own data
 * This middleware should be used AFTER authenticateToken middleware
 */
export function authorizeUserAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Ensure user is authenticated (this should be set by authenticateToken middleware)
  if (!req.user) {
    throw new ForbiddenError('User authentication required');
  }

  // Get the requested userId from the route parameter
  const requestedUserId = req.params.userId;

  // Validate that userId parameter exists and is not empty/whitespace
  if (!requestedUserId || requestedUserId.trim() === '') {
    throw new ForbiddenError('User ID parameter is required');
  }

  // Compare the authenticated user's ID with the requested user ID
  if (req.user.userId !== requestedUserId) {
    throw new ForbiddenError('Access denied: You can only access your own data');
  }

  next();
} 
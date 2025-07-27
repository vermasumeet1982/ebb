import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { loginUser } from '../commands/login-user';
import { LoginRequest } from '../schema/auth.schema';

// Prisma client instance (will be injected)
let prismaClient: PrismaClient;

/**
 * Initialize the auth controller with Prisma client
 */
export function initAuthController(prisma: PrismaClient): void {
  prismaClient = prisma;
}

/**
 * Handle POST /auth/login - Authenticate user
 */
export async function loginUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Request body is already validated by middleware
    const loginData = req.body as LoginRequest;
    
    // Authenticate user via service layer
    const result = await loginUser(prismaClient, loginData);
    
    // Return success response with JWT token
    res.status(200).json(result);
  } catch (error) {
    // Pass error to error handling middleware
    next(error);
  }
} 
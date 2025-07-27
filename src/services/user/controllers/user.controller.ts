import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createUser } from '../commands/create-user';
import { getUser } from '../querier/get-user';
import { CreateUserRequest } from '../schema/user.schema';
import { mapUserToResponse, mapPrismaUserToUser } from '../mapper/user.mapper';

// Prisma client instance (will be injected)
let prismaClient: PrismaClient;

/**
 * Initialize the user controller with Prisma client
 */
export function initUserController(prisma: PrismaClient): void {
  prismaClient = prisma;
}

/**
 * Handle POST /v1/users - Create new user
 */
export async function createUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Request body is already validated by middleware
    const userData = req.body as CreateUserRequest;
    
    // Create user via service layer
    const dbUserEntity = await createUser(prismaClient, userData);
    
    // Convert Prisma User to our User interface using mapper
    const user = mapPrismaUserToUser(dbUserEntity);
    
    // Map internal entity to API response
    const response = mapUserToResponse(user);
    
    // Return success response
    res.status(201).json(response);
  } catch (error) {
    // Pass error to error handling middleware
    next(error);
  }
}

/**
 * Handle GET /v1/users/{userId} - Get user by ID
 */
export async function getUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get userId from path parameters
    const { userId } = req.params;
    
    // Ensure userId is provided (Express should handle this, but TypeScript needs it)
    if (!userId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required',
        statusCode: 400,
      });
      return;
    }
    
    // Get user via service layer
    const dbUserEntity = await getUser(prismaClient, userId);
    
    // Convert Prisma User to our User interface using mapper
    const user = mapPrismaUserToUser(dbUserEntity);
    
    // Map internal entity to API response
    const response = mapUserToResponse(user);
    
    // Return success response
    res.status(200).json(response);
  } catch (error) {
    // Pass error to error handling middleware
    next(error);
  }
} 
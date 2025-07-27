import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createUser } from '../commands/create-user';
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
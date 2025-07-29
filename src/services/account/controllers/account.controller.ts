import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createBankAccount } from '../commands/create-bank-account';
import { listAccounts } from '../querier/list-accounts';
import { mapAccountToResponse } from '../mapper/account.mapper';
import { UnauthorizedError, NotFoundError } from '@/shared/utils/errors.util';

let prismaClient: PrismaClient;

/**
 * Initialize controller with dependencies
 */
export function initAccountController(prisma: PrismaClient): void {
  prismaClient = prisma;
}

/**
 * Handle GET /v1/accounts - List bank accounts
 */
export async function listAccountsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Defensive check for authentication
    if (!req.user?.userId) {
      // TODO: Replace console.error with proper logging library (e.g., Winston/Pino)
      // for better error tracking and log management in production
      console.error('Authentication failed:', {
        path: '/v1/accounts',
        method: 'GET',
        user: req.user || 'undefined',
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedError('Authentication required');
    }

    // Look up user's internal ID
    const user = await prismaClient.user.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Fetch all accounts for the user
    const dbBankAccounts = await listAccounts(prismaClient, user.id);

    // Map to response DTOs
    const response = {
      accounts: dbBankAccounts.map(mapAccountToResponse),
    };

    // Return 200 OK
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle POST /v1/accounts - Create bank account
 */
export async function createBankAccountHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Defensive check for authentication
    if (!req.user?.userId) {
      // TODO: Replace console.error with proper logging library (e.g., Winston/Pino)
      // for better error tracking and log management in production
      console.error('Authentication failed:', {
        path: '/v1/accounts',
        method: 'POST',
        user: req.user || 'undefined',
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedError('Authentication required');
    }

    // Look up user's internal ID
    const user = await prismaClient.user.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Create bank account using internal user ID
    const dbBankAccount = await createBankAccount(prismaClient, user.id, req.body);

    // Map to response DTO
    const response = mapAccountToResponse(dbBankAccount);

    // Return 201 Created
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
} 
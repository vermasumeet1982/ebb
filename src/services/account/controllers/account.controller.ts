import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createBankAccount } from '../commands/create-bank-account';
import { listAccounts } from '../querier/list-accounts';
import { getAccount } from '../querier/get-account';
import { updateBankAccount } from '../commands/update-bank-account';
import { mapAccountToResponse } from '../mapper/account.mapper';
import { UnauthorizedError, NotFoundError, ValidationError } from '@/shared/utils/error.utils';
import { isValidAccountNumber } from '@/shared/utils/validation.util';

let prismaClient: PrismaClient;

/**
 * Initialize controller with dependencies
 */
export function initAccountController(prisma: PrismaClient): void {
  prismaClient = prisma;
}

/**
 * Handle GET /v1/accounts/{accountNumber} - Get bank account by number
 */
export async function getAccountHandler(
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
        path: `/v1/accounts/${req.params.accountNumber}`,
        method: 'GET',
        user: req.user || 'undefined',
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedError('Authentication required');
    }

    const { accountNumber } = req.params;

    // Validate account number format
    if (!accountNumber || !isValidAccountNumber(accountNumber)) {
      throw new ValidationError('Invalid account number format');
    }

    // Look up user's internal ID
    const user = await prismaClient.user.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get account details
    const dbBankAccount = await getAccount(prismaClient, accountNumber, user.id);

    // Map to response DTO
    const response = mapAccountToResponse(dbBankAccount);

    // Return 200 OK
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
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

/**
 * Handle PATCH /v1/accounts/{accountNumber} - Update bank account
 */
export async function updateAccountHandler(
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
        path: `/v1/accounts/${req.params.accountNumber}`,
        method: 'PATCH',
        user: req.user || 'undefined',
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedError('Authentication required');
    }

    const { accountNumber } = req.params;

    // Validate account number format
    if (!accountNumber || !isValidAccountNumber(accountNumber)) {
      throw new ValidationError('Invalid account number format');
    }

    // Look up user's internal ID
    const user = await prismaClient.user.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update account
    const dbBankAccount = await updateBankAccount(
      prismaClient,
      accountNumber,
      user.id,
      req.body
    );

    // Map to response DTO
    const response = mapAccountToResponse(dbBankAccount);

    // Return 200 OK
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
} 
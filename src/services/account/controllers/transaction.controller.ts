import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createTransaction } from '../commands/create-transaction';
import { listTransactions } from '../querier/list-transactions';
import { mapTransactionToResponse } from '../mapper/account.mapper';
import { UnauthorizedError, NotFoundError, ValidationError } from '../../../shared/utils/errors.util';
import { isValidAccountNumber } from '../../../shared/utils/validation.util';

let prismaClient: PrismaClient;

/**
 * Initialize controller with dependencies
 */
export function initTransactionController(prisma: PrismaClient): void {
  prismaClient = prisma;
}

/**
 * Handle POST /v1/accounts/{accountNumber}/transactions - Create transaction
 */
export async function createTransactionHandler(
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
        path: `/v1/accounts/${req.params.accountNumber}/transactions`,
        method: 'POST',
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

    // Create transaction
    const dbTransaction = await createTransaction(
      prismaClient,
      accountNumber,
      user.id,
      req.body
    );

    // Map to response DTO
    const response = mapTransactionToResponse(dbTransaction);

    // Return 201 Created
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /v1/accounts/{accountNumber}/transactions - List transactions
 */
export async function listTransactionsHandler(
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
        path: `/v1/accounts/${req.params.accountNumber}/transactions`,
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

    // List transactions
    const dbTransactions = await listTransactions(
      prismaClient,
      accountNumber,
      user.id
    );

    // Map to response DTOs
    const transactions = dbTransactions.map(mapTransactionToResponse);

    // Return response matching OpenAPI spec
    res.status(200).json({ transactions });
  } catch (error) {
    next(error);
  }
} 
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConflictError, UnauthorizedError, ValidationError, NotFoundError } from '../utils/errors.util';

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error('❌ Error occurred:', error);
  console.error('📋 Request details:', { method: req.method, url: req.url });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      type: 'validation_error',
    }));

    res.status(400).json({
      message: 'Validation failed',
      details: validationErrors,
    });
    return;
  }

  // Handle custom validation errors
  if (error instanceof ValidationError) {
    res.status(400).json({
      message: error.message,
    });
    return;
  }

  // Handle not found errors
  if (error instanceof NotFoundError) {
    res.status(404).json({
      message: error.message,
    });
    return;
  }

  // Handle Prisma unique constraint violations
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({
        message: 'A record with this information already exists',
      });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({
        message: 'Record not found',
      });
      return;
    }
  }

  // Handle custom conflict errors
  if (error instanceof ConflictError) {
    res.status(409).json({
      message: error.message,
    });
    return;
  }

   // Handle unauthorized errors
   if (error instanceof UnauthorizedError) {
    res.status(401).json({
      message: error.message,
    });
    return;
  }
  
  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({
      message: 'Invalid or expired token',
    });
    return;
  }

  // Default error response
  res.status(500).json({
    message: 'An unexpected error occurred',
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  res.status(404).json({
    message: `Route ${req.method} ${req.url} not found`,
  });
} 
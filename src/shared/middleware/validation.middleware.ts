import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware to validate request body against a Zod schema
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      next();
    } catch (error) {
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
      } else {
        next(error);
      }
    }
  };
}

/**
 * Middleware to validate request parameters against a Zod schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          type: 'validation_error',
        }));

        res.status(400).json({
          message: 'Invalid parameters',
          details: validationErrors,
        });
      } else {
        next(error);
      }
    }
  };
} 
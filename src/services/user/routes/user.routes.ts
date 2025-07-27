import { Router } from 'express';
import { createUserHandler, getUserHandler } from '../controllers/user.controller';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import { authenticateToken } from '@/shared/middleware/auth.middleware';
import { CreateUserSchema } from '../schema/user.schema';

// Create router instance
const router = Router();

// Create user route
router.post(
  '/v1/users',
  validateRequest(CreateUserSchema),
  (req, res, next) => {
    void createUserHandler(req, res, next);
  }
);

// Get user by ID route
router.get(
  '/v1/users/:userId',
  authenticateToken,
  (req, res, next) => {
    void getUserHandler(req, res, next);
  }
);

export { router as userRoutes }; 
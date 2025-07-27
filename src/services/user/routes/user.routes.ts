import { Router } from 'express';
import { createUserHandler, getUserHandler, updateUserHandler } from '../controllers/user.controller';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import { authenticateToken } from '@/shared/middleware/auth.middleware';
import { authorizeUserAccess } from '@/shared/middleware/authorization.middleware';
import { CreateUserSchema, UpdateUserSchema } from '../schema/user.schema';

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
  authorizeUserAccess,
  (req, res, next) => {
    void getUserHandler(req, res, next);
  }
);

// Update user by ID route
router.patch(
  '/v1/users/:userId',
  authenticateToken,
  authorizeUserAccess,
  validateRequest(UpdateUserSchema),
  (req, res, next) => {
    void updateUserHandler(req, res, next);
  }
);

export { router as userRoutes }; 
import { Router } from 'express';
import { createUserHandler } from '../controllers/user.controller';
import { validateRequest } from '@/shared/middleware/validation.middleware';
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

export { router as userRoutes }; 
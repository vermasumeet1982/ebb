import { Router } from 'express';
import { loginUserHandler } from '../controllers/auth.controller';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import { LoginSchema } from '../schema/auth.schema';

// Create router instance
const router = Router();

// Login route
router.post(
  '/v1/auth/login',
  validateRequest(LoginSchema),
  (req, res, next) => {
    void loginUserHandler(req, res, next);
  }
);

export { router as authRoutes }; 
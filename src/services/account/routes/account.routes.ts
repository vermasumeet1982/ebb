import { Router } from 'express';
import { createBankAccountHandler } from '../controllers/account.controller';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import { authenticateToken } from '@/shared/middleware/auth.middleware';
import { CreateBankAccountSchema } from '../schema/account.schema';

// Create router instance
const router = Router();

// Create bank account route
router.post(
  '/v1/accounts',
  authenticateToken,
  validateRequest(CreateBankAccountSchema),
  (req, res, next) => {
    void createBankAccountHandler(req, res, next);
  }
);

export { router as accountRoutes }; 
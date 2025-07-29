import { Router } from 'express';
import {
  createBankAccountHandler,
  listAccountsHandler,
  getAccountHandler,
} from '../controllers/account.controller';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import { authenticateToken } from '@/shared/middleware/auth.middleware';
import { CreateBankAccountSchema } from '../schema/account.schema';

// Create router instance
const router = Router();

// List accounts route
router.get(
  '/v1/accounts',
  authenticateToken,
  (req, res, next) => {
    void listAccountsHandler(req, res, next);
  }
);

// Get account by number route
router.get(
  '/v1/accounts/:accountNumber',
  authenticateToken,
  (req, res, next) => {
    void getAccountHandler(req, res, next);
  }
);

// Create account route
router.post(
  '/v1/accounts',
  authenticateToken,
  validateRequest(CreateBankAccountSchema),
  (req, res, next) => {
    void createBankAccountHandler(req, res, next);
  }
);

export const accountRoutes = router; 
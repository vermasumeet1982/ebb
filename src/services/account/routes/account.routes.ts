import { Router } from 'express';
import {
  createBankAccountHandler,
  listAccountsHandler,
  getAccountHandler,
  updateAccountHandler,
} from '../controllers/account.controller';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import { authenticateToken } from '@/shared/middleware/auth.middleware';
import { CreateBankAccountSchema, UpdateBankAccountSchema } from '../schema/account.schema';

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

// Update account by number route
router.patch(
  '/v1/accounts/:accountNumber',
  authenticateToken,
  validateRequest(UpdateBankAccountSchema),
  (req, res, next) => {
    void updateAccountHandler(req, res, next);
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
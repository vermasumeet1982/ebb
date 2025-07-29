import { Router } from 'express';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';
import { 
  createTransactionHandler, 
  listTransactionsHandler,
  fetchTransactionHandler,
} from '../controllers/transaction.controller';
import { CreateTransactionSchema } from '../schema/transaction.schema';

// Create router instance
const router = Router();

// Create transaction route
router.post(
  '/v1/accounts/:accountNumber/transactions',
  authenticateToken,
  validateRequest(CreateTransactionSchema),
  (req, res, next) => {
    void createTransactionHandler(req, res, next);
  }
);

// List transactions route
router.get(
  '/v1/accounts/:accountNumber/transactions',
  authenticateToken,
  (req, res, next) => {
    void listTransactionsHandler(req, res, next);
  }
);

// Fetch single transaction route
/** @openapi
 * /v1/accounts/{accountNumber}/transactions/{transactionId}:
 *   get:
 *     tags: [transaction]
 *     summary: Fetch transaction by ID
 */
router.get(
  '/v1/accounts/:accountNumber/transactions/:transactionId',
  authenticateToken,
  (req, res, next) => {
    void fetchTransactionHandler(req, res, next);
  }
);

export const transactionRoutes = router; 
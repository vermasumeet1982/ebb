import {
  mapAccountToResponse,
  mapTransactionToResponse,
} from '../account.mapper';
import {
  BankAccount,
  Transaction,
  AccountType,
  Currency,
  TransactionType,
} from '../../entities';

describe('Account Mapper', () => {
  describe('mapAccountToResponse', () => {
    const mockBankAccount: BankAccount = {
      id: 'internal-account-uuid-456',
      accountNumber: '01234567',
      sortCode: '10-10-10',
      name: 'Personal Savings Account',
      accountType: AccountType.PERSONAL,
      balance: 1500.75,
      currency: Currency.GBP,
      userId: 'usr-abc123def456',
      createdTimestamp: new Date('2024-01-15T10:30:00.000Z'),
      updatedTimestamp: new Date('2024-01-20T16:45:00.000Z'),
    };

    it('should map BankAccount entity to BankAccountResponse DTO correctly', () => {
      const result = mapAccountToResponse(mockBankAccount);

      expect(result).toEqual({
        accountNumber: '01234567',
        sortCode: '10-10-10',
        name: 'Personal Savings Account',
        accountType: AccountType.PERSONAL,
        balance: 1500.75,
        currency: Currency.GBP,
        createdTimestamp: '2024-01-15T10:30:00.000Z',
        updatedTimestamp: '2024-01-20T16:45:00.000Z',
      });
    });

    it('should convert Date objects to ISO strings', () => {
      const result = mapAccountToResponse(mockBankAccount);

      expect(typeof result.createdTimestamp).toBe('string');
      expect(typeof result.updatedTimestamp).toBe('string');
      expect(result.createdTimestamp).toBe('2024-01-15T10:30:00.000Z');
      expect(result.updatedTimestamp).toBe('2024-01-20T16:45:00.000Z');
    });

    it('should not expose internal database ID', () => {
      const result = mapAccountToResponse(mockBankAccount);

      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('userId');
      expect(Object.keys(result)).not.toContain('id');
      expect(Object.keys(result)).not.toContain('userId');
    });

    it('should handle GBP currency', () => {
      const gbpAccount: BankAccount = {
        ...mockBankAccount,
        currency: Currency.GBP,
        balance: 2000.00,
      };

      const result = mapAccountToResponse(gbpAccount);

      expect(result.currency).toBe(Currency.GBP);
      expect(result.balance).toBe(2000.00);
    });

    it('should preserve balance precision', () => {
      const accountWithPreciseBalance: BankAccount = {
        ...mockBankAccount,
        balance: 999.99,
      };

      const result = mapAccountToResponse(accountWithPreciseBalance);

      expect(result.balance).toBe(999.99);
    });

    it('should handle zero balance', () => {
      const zeroBalanceAccount: BankAccount = {
        ...mockBankAccount,
        balance: 0.00,
      };

      const result = mapAccountToResponse(zeroBalanceAccount);

      expect(result.balance).toBe(0.00);
    });
  });

  describe('mapTransactionToResponse', () => {
    const mockTransaction: Transaction = {
      id: 'internal-transaction-uuid-789',
      transactionId: 'tan-xyz789abc123',
      amount: 250.50,
      currency: Currency.GBP,
      type: TransactionType.DEPOSIT,
      reference: 'Salary payment',
      userId: 'usr-abc123def456',
      accountNumber: '01234567',
      createdTimestamp: new Date('2024-01-15T14:30:00.000Z'),
    };

    it('should map Transaction entity to TransactionResponse DTO correctly', () => {
      const result = mapTransactionToResponse(mockTransaction);

      expect(result).toEqual({
        id: 'tan-xyz789abc123', // Internal transactionId mapped to API id
        amount: 250.50,
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        reference: 'Salary payment',
        userId: 'usr-abc123def456',
        createdTimestamp: '2024-01-15T14:30:00.000Z',
      });
    });

    it('should map internal transactionId to API id field', () => {
      const result = mapTransactionToResponse(mockTransaction);

      expect(result.id).toBe(mockTransaction.transactionId);
      expect(result.id).not.toBe(mockTransaction.id); // Should not expose internal ID
    });

    it('should convert Date object to ISO string', () => {
      const result = mapTransactionToResponse(mockTransaction);

      expect(typeof result.createdTimestamp).toBe('string');
      expect(result.createdTimestamp).toBe('2024-01-15T14:30:00.000Z');
    });

    it('should handle withdrawal transactions', () => {
      const withdrawalTransaction: Transaction = {
        ...mockTransaction,
        type: TransactionType.WITHDRAWAL,
        amount: 100.00,
        reference: 'ATM withdrawal',
      };

      const result = mapTransactionToResponse(withdrawalTransaction);

      expect(result.type).toBe(TransactionType.WITHDRAWAL);
      expect(result.amount).toBe(100.00);
      expect(result.reference).toBe('ATM withdrawal');
    });

    it('should handle transaction without reference', () => {
      const transactionWithoutReference: Transaction = {
        id: 'internal-transaction-uuid-789',
        transactionId: 'tan-xyz789abc123',
        amount: 250.50,
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        userId: 'usr-abc123def456',
        accountNumber: '01234567',
        createdTimestamp: new Date('2024-01-15T14:30:00.000Z'),
      };

      const result = mapTransactionToResponse(transactionWithoutReference);

      expect(result).not.toHaveProperty('reference');
      expect(Object.keys(result)).not.toContain('reference');
    });

    it('should include reference when it exists', () => {
      const transactionWithReference: Transaction = {
        ...mockTransaction,
        reference: 'Online transfer',
      };

      const result = mapTransactionToResponse(transactionWithReference);

      expect(result.reference).toBe('Online transfer');
    });

    it('should handle empty string reference', () => {
      const transactionWithEmptyReference: Transaction = {
        id: 'internal-transaction-uuid-789',
        transactionId: 'tan-xyz789abc123',
        amount: 250.50,
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        reference: '',
        userId: 'usr-abc123def456',
        accountNumber: '01234567',
        createdTimestamp: new Date('2024-01-15T14:30:00.000Z'),
      };

      const result = mapTransactionToResponse(transactionWithEmptyReference);

      // Empty string is falsy, so reference should not be included
      expect(result).not.toHaveProperty('reference');
      expect(Object.keys(result)).not.toContain('reference');
    });

    it('should preserve customer-facing userId', () => {
      const result = mapTransactionToResponse(mockTransaction);

      expect(result.userId).toBe('usr-abc123def456');
      expect(result.userId).toBe(mockTransaction.userId);
    });

    it('should not expose internal fields', () => {
      const result = mapTransactionToResponse(mockTransaction);

      expect(result).not.toHaveProperty('accountNumber');
      expect(Object.keys(result)).not.toContain('accountNumber');
    });

    it('should handle GBP currency in transactions', () => {
      const gbpTransaction: Transaction = {
        ...mockTransaction,
        currency: Currency.GBP,
        amount: 300.75,
      };

      const result = mapTransactionToResponse(gbpTransaction);

      expect(result.currency).toBe(Currency.GBP);
      expect(result.amount).toBe(300.75);
    });

    it('should preserve amount precision', () => {
      const preciseTransaction: Transaction = {
        ...mockTransaction,
        amount: 999.99,
      };

      const result = mapTransactionToResponse(preciseTransaction);

      expect(result.amount).toBe(999.99);
    });

    it('should handle minimum deposit amount', () => {
      const minDepositTransaction: Transaction = {
        ...mockTransaction,
        type: TransactionType.DEPOSIT,
        amount: 0.01,
      };

      const result = mapTransactionToResponse(minDepositTransaction);

      expect(result.amount).toBe(0.01);
      expect(result.type).toBe(TransactionType.DEPOSIT);
    });
  });
}); 
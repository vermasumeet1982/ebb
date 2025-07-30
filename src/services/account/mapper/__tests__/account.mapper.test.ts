import { Decimal } from 'decimal.js';
import { mapAccountToResponse, mapTransactionToResponse } from '../account.mapper';
import { AccountType, Currency } from '../../entities/account';
import { Transaction, TransactionType } from '../../entities/transaction';
import { BankAccountResponse } from '../../entities/account.dto';
import { TransactionResponse } from '../../entities/transaction.dto';

describe('Account Mapper', () => {
  describe('mapAccountToResponse', () => {
    it('should map BankAccount to BankAccountResponse', () => {
      // Arrange
      const bankAccount = {
        id: 'acc-123', // Internal ID
        accountNumber: '01123456',
        sortCode: '10-10-10',
        name: 'My Personal Account',
        accountType: AccountType.PERSONAL,
        balance: new Decimal('1500.75'),
        currency: Currency.GBP,
        userId: 'usr-abc123',
        createdTimestamp: new Date('2024-01-01T00:00:00Z'),
        updatedTimestamp: new Date('2024-01-01T00:00:00Z'),
      };

      // Act
      const response = mapAccountToResponse(bankAccount);

      // Assert
      const expected: BankAccountResponse = {
        accountNumber: '01123456',
        sortCode: '10-10-10',
        name: 'My Personal Account',
        accountType: AccountType.PERSONAL,
        balance: 1500.75,
        currency: Currency.GBP,
        createdTimestamp: '2024-01-01T00:00:00.000Z',
        updatedTimestamp: '2024-01-01T00:00:00.000Z',
      };
      expect(response).toEqual(expected);
    });

    it.each([
      {
        input: '2000.00',
        expected: 2000.00,
        description: 'whole number',
      },
      {
        input: '999.99',
        expected: 999.99,
        description: 'decimal places',
      },
      {
        input: '0.00',
        expected: 0.00,
        description: 'zero balance',
      },
    ])('should handle balance value: $description', ({ input, expected }) => {
      // Arrange
      const bankAccount = {
        id: 'acc-123',
        accountNumber: '01123456',
        sortCode: '10-10-10',
        name: 'Test Account',
        accountType: AccountType.PERSONAL,
        balance: new Decimal(input),
        currency: Currency.GBP,
        userId: 'usr-abc123',
        createdTimestamp: new Date('2024-01-01T00:00:00Z'),
        updatedTimestamp: new Date('2024-01-01T00:00:00Z'),
      };

      // Act
      const response = mapAccountToResponse(bankAccount);

      // Assert
      expect(typeof response.balance).toBe('number');
      expect(response.balance).toBe(expected);
    });
  });

  describe('mapTransactionToResponse', () => {
    it('should map Transaction to TransactionResponse', () => {
      // Arrange
      const transaction: Transaction = {
        id: 'txn-123', // Internal ID
        transactionId: 'tan-abc123', // Customer-facing ID
        amount: new Decimal('50.25'),
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        reference: 'Test transaction',
        userId: 'usr-abc123',
        accountNumber: '01123456',
        createdTimestamp: new Date('2024-01-01T00:00:00Z'),
      };

      // Act
      const response = mapTransactionToResponse(transaction);

      // Assert
      const expected: TransactionResponse = {
        id: 'tan-abc123', // Maps internal transactionId to API id
        amount: 50.25,
        currency: Currency.GBP,
        type: TransactionType.DEPOSIT,
        reference: 'Test transaction',
        userId: 'usr-abc123',
        createdTimestamp: '2024-01-01T00:00:00.000Z',
      };
      expect(response).toEqual(expected);
    });

    it('should handle transaction without reference', () => {
      // Arrange
      const transaction: Transaction = {
        id: 'txn-123',
        transactionId: 'tan-abc123',
        amount: new Decimal('50.25'),
        currency: Currency.GBP,
        type: TransactionType.WITHDRAWAL,
        userId: 'usr-abc123',
        accountNumber: '01123456',
        createdTimestamp: new Date('2024-01-01T00:00:00Z'),
      };

      // Act
      const response = mapTransactionToResponse(transaction);

      // Assert
      const expected: TransactionResponse = {
        id: 'tan-abc123',
        amount: 50.25,
        currency: Currency.GBP,
        type: TransactionType.WITHDRAWAL,
        userId: 'usr-abc123',
        createdTimestamp: '2024-01-01T00:00:00.000Z',
      };
      expect(response).toEqual(expected);
      expect(response).not.toHaveProperty('reference');
    });
  });
}); 
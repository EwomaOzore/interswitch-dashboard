import { Account, Transaction, TransferRequest } from '../../src/lib/api';

// Mock accounts data
export const mockAccounts: Account[] = [
  {
    id: '1',
    accountNumber: '1234567890',
    accountType: 'Savings',
    balance: 150000.5,
    currency: 'NGN',
    lastTransactionDate: '2024-01-10T10:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    accountNumber: '0987654321',
    accountType: 'Current',
    balance: 75000.25,
    currency: 'NGN',
    lastTransactionDate: '2024-01-09T14:15:00Z',
    status: 'active',
  },
];

// Mock transactions data
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-10T10:30:00Z',
    description: 'Online Purchase - Amazon',
    amount: -5000,
    type: 'debit',
    balanceAfter: 150000.5,
    reference: 'TXN001',
    category: 'Shopping',
  },
  {
    id: '2',
    date: '2024-01-09T14:15:00Z',
    description: 'Salary Credit',
    amount: 250000,
    type: 'credit',
    balanceAfter: 155000.5,
    reference: 'SAL001',
    category: 'Income',
  },
];

// Mock transfer request
export const mockTransferRequest: TransferRequest = {
  sourceAccountId: '1',
  beneficiaryAccountNumber: '1111111111',
  amount: 5000,
  description: 'Test transfer',
  pin: '1234',
};

// Mock API client
export const mockApiClient = {
  getAccounts: jest.fn().mockResolvedValue({ accounts: mockAccounts }),
  getAccount: jest.fn().mockResolvedValue({ account: mockAccounts[0] }),
  getTransactions: jest.fn().mockResolvedValue({
    transactions: mockTransactions,
    totalCount: mockTransactions.length,
    hasMore: false,
  }),
  initiateTransfer: jest.fn().mockResolvedValue({
    transferId: 'TXN_123',
    status: 'success',
    message: 'Transfer successful',
  }),
};

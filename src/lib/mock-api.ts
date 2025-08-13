import { Account, Transaction } from './api-client';

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

export const mockApi = {
  accounts: mockAccounts,
  transactions: mockTransactions,
};

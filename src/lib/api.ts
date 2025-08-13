import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const AccountSchema = z.object({
  id: z.string(),
  accountNumber: z.string(),
  accountType: z.enum(['Savings', 'Current', 'Loan']),
  balance: z.number(),
  currency: z.string().default('NGN'),
  lastTransactionDate: z.string(),
  status: z.enum(['active', 'inactive', 'frozen']).default('active'),
});

export const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['debit', 'credit']),
  balanceAfter: z.number(),
  reference: z.string().optional(),
  category: z.string().optional(),
});

export const TransferRequestSchema = z.object({
  sourceAccountId: z.string(),
  beneficiaryAccountNumber: z.string().min(10, 'Account number must be at least 10 digits'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  pin: z.string().optional(),
});

export type Account = z.infer<typeof AccountSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransferRequest = z.infer<typeof TransferRequestSchema>;

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const token = await this.getAuthToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private async getAuthToken(): Promise<string | null> {
    return 'mock-jwt-token';
  }

  async getAccounts(): Promise<Account[]> {
    const response = await this.request<{ accounts: Account[] }>('/accounts');
    return AccountSchema.array().parse(response.accounts);
  }

  async getAccount(id: string): Promise<Account> {
    const response = await this.request<{ account: Account }>(`/accounts/${id}`);
    return AccountSchema.parse(response.account);
  }

  async getTransactions(
    accountId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      type?: 'debit' | 'credit';
    }
  ): Promise<{ transactions: Transaction[]; totalCount: number; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.type) searchParams.append('type', params.type);

    const response = await this.request<{
      transactions: Transaction[];
      totalCount: number;
      hasMore: boolean;
    }>(`/accounts/${accountId}/transactions?${searchParams}`);

    return {
      transactions: TransactionSchema.array().parse(response.transactions),
      totalCount: response.totalCount,
      hasMore: response.hasMore,
    };
  }

  async initiateTransfer(request: TransferRequest): Promise<{
    transferId: string;
    status: 'pending' | 'success' | 'failed';
    message: string;
  }> {
    const validatedRequest = TransferRequestSchema.parse(request);
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify(validatedRequest),
    });
  }

  async getTransferStatus(transferId: string): Promise<{
    status: 'pending' | 'success' | 'failed';
    message: string;
  }> {
    return this.request(`/transfers/${transferId}/status`);
  }
}

export const apiClient = new APIClient();

export const mockApi = {
  accounts: [
    {
      id: '1',
      accountNumber: '1234567890',
      accountType: 'Savings' as const,
      balance: 150000.50,
      currency: 'NGN',
      lastTransactionDate: '2024-01-10T10:30:00Z',
      status: 'active' as const,
    },
    {
      id: '2',
      accountNumber: '0987654321',
      accountType: 'Current' as const,
      balance: 75000.25,
      currency: 'NGN',
      lastTransactionDate: '2024-01-09T14:15:00Z',
      status: 'active' as const,
    },
  ] as Account[],

  transactions: [
    {
      id: '1',
      date: '2024-01-10T10:30:00Z',
      description: 'Online Purchase - Amazon',
      amount: -5000,
      type: 'debit' as const,
      balanceAfter: 150000.50,
      reference: 'TXN001',
      category: 'Shopping',
    },
    {
      id: '2',
      date: '2024-01-09T14:15:00Z',
      description: 'Salary Credit',
      amount: 250000,
      type: 'credit' as const,
      balanceAfter: 155000.50,
      reference: 'SAL001',
      category: 'Income',
    },
  ] as Transaction[],
};
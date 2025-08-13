import { getAuthSession, getRefreshToken } from './auth-utils';
import { OAuth2Error } from '../types/auth';
import { AccountsResponse, AccountResponse, TransactionsResponse, TransferResponse } from '../types/api';

export interface Account {
  id: string;
  accountNumber: string;
  accountType: 'Savings' | 'Current' | 'Loan';
  balance: number;
  currency: string;
  lastTransactionDate: string;
  status: 'active' | 'inactive' | 'frozen';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balanceAfter: number;
  reference?: string;
  category?: string;
}

export interface TransferRequest {
  sourceAccountId: string;
  beneficiaryAccountNumber: string;
  amount: number;
  description: string;
  pin: string;
}

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  retryOnAuthError?: boolean;
}

class ApiClient {
  private readonly baseURL: string;
  private readonly timeout: number;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getAuthSession();
    if (session?.token?.access_token) {
      const headers = {
        'Authorization': `Bearer ${session.token.access_token}`,
        'Content-Type': 'application/json',
      };
      return headers;
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleAuthError(response: Response): Promise<Response> {
    if (response.status === 401) {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        const newHeaders = await this.getAuthHeaders();
        const newResponse = await fetch(response.url, {
          ...response,
          headers: newHeaders,
        });
        return newResponse;
      }
    }
    return response;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      requiresAuth = true,
      retryOnAuthError = true,
      ...requestConfig
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const headers = requiresAuth
      ? await this.getAuthHeaders()
      : { 'Content-Type': 'application/json' };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      let response = await fetch(url, {
        ...requestConfig,
        headers: {
          ...headers,
          ...requestConfig.headers,
        },
        signal: controller.signal,
      });

      if (retryOnAuthError && response.status === 401) {
        response = await this.handleAuthError(response);
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: OAuth2Error = await response.json().catch(() => ({
          error: 'unknown_error',
          error_description: 'An unknown error occurred',
        }));

        throw new Error(errorData.error_description || errorData.error || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }

      throw new Error('Network error');
    }
  }

  async getAccounts(): Promise<AccountsResponse> {
    return this.request<AccountsResponse>('/api/accounts', { requiresAuth: false });
  }

  async getAccount(id: string): Promise<AccountResponse> {
    return this.request<AccountResponse>(`/api/accounts/${id}`, { requiresAuth: true });
  }

  async getAccountTransactions(
    accountId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      type?: 'debit' | 'credit';
    }
  ): Promise<TransactionsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.type) searchParams.append('type', params.type);

    const queryString = searchParams.toString();
    const endpoint = '/api/accounts/' + accountId + '/transactions' + (queryString ? '?' + queryString : '');

    return this.request<TransactionsResponse>(endpoint, { requiresAuth: true });
  }

  async initiateTransfer(transferData: any): Promise<TransferResponse> {
    return this.request<TransferResponse>('/api/transfers', {
      method: 'POST',
      body: JSON.stringify(transferData),
      requiresAuth: true,
    });
  }

  async getTransferStatus(transferId: string) {
    return this.request(`/api/transfers/${transferId}/status`, { requiresAuth: true });
  }

  async getUserInfo() {
    return this.request('/api/auth/userinfo', { requiresAuth: true });
  }

  async getPublicInfo() {
    return this.request('/api/public/info', { requiresAuth: false });
  }
}

export const apiClient = new ApiClient({
  baseURL: '',
  timeout: 10000,
});

export { ApiClient }; 
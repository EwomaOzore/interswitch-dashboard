import { Account, Transaction } from '../lib/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}


export interface AccountsResponse {
  accounts: Account[];
  totalCount: number;
}

export interface AccountResponse {
  account: Account;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Transfer API responses
export interface TransferResponse {
  transferId: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// API request types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface FilterParams {
  type?: string;
  status?: string;
  category?: string;
}

// Combined params for common API calls
export type ListParams = PaginationParams & DateRangeParams & FilterParams;

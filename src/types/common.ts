export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'failed';

export type TransactionType = 'debit' | 'credit';

export type AccountType = 'Savings' | 'Current' | 'Loan';

export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface BaseFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResult<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'failed';

export type TransactionType = 'debit' | 'credit';

export type AccountType = 'Savings' | 'Current' | 'Loan';

// Currency types
export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

// Date and time types
export type ISODateString = string; // ISO 8601 date string

export type Timestamp = number; // Unix timestamp in milliseconds

// Form types
export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Pagination types
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Filter types
export interface BaseFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API response wrapper
export interface ApiResult<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

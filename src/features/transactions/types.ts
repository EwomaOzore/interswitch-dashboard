export interface TransactionFilters {
  type?: 'debit' | 'credit';
  startDate?: string;
  endDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionSortOptions {
  field: 'date' | 'amount' | 'description';
  direction: 'asc' | 'desc';
}

export interface TransactionSummary {
  totalCredits: number;
  totalDebits: number;
  netAmount: number;
  transactionCount: number;
}

export interface AccountSummary {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
}

export interface AccountFilters {
  type?: string;
  status?: string;
  minBalance?: number;
  maxBalance?: number;
}

export interface AccountSortOptions {
  field: 'balance' | 'lastTransaction' | 'accountType';
  direction: 'asc' | 'desc';
}

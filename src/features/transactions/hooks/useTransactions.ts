import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';

interface UseTransactionsOptions {
  accountId?: string;
  type?: 'debit' | 'credit';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'transactions',
      options.accountId,
      options.type,
      options.startDate,
      options.endDate,
      options.page,
      options.limit,
    ],
    queryFn: () => {
      if (!options.accountId) {
        throw new Error('Account ID is required');
      }
      return apiClient.getTransactions(options.accountId, {
        type: options.type,
        startDate: options.startDate,
        endDate: options.endDate,
        page: options.page,
        limit: options.limit,
      });
    },
    enabled: !!options.accountId,
  });

  const transactions = transactionsData?.transactions || [];
  const totalCount = transactionsData?.totalCount || 0;
  const hasMore = transactionsData?.hasMore || false;

  return {
    transactions,
    totalCount,
    hasMore,
    isLoading,
    error,
    refetch,
  };
}

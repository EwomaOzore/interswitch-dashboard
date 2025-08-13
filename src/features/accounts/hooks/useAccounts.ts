import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';

export function useAccounts() {
  const {
    data: accounts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: apiClient.getAccounts,
  });

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const activeAccounts = accounts.filter((account) => account.status === 'active');
  const savingsAccounts = accounts.filter((account) => account.accountType === 'Savings');
  const currentAccounts = accounts.filter((account) => account.accountType === 'Current');

  return {
    accounts,
    isLoading,
    error,
    refetch,
    totalBalance,
    activeAccounts,
    savingsAccounts,
    currentAccounts,
  };
}

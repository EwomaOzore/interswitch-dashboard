import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../lib/api-client';
import { TransactionsList } from '../../../components/TransactionsList';
import { Layout } from '../../../components/layout/Layout';
import { Button, Dropdown } from '../../../components/ui';
import { downloadCSV } from '../../../lib/utils';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { DropdownOption } from '../../../components/ui/Dropdown';

export default function AccountTransactions() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const transactionTypeOptions: DropdownOption[] = [
    { value: 'all', label: 'All Transactions' },
    { value: 'credit', label: 'Credits Only' },
    { value: 'debit', label: 'Debits Only' },
  ];

  const {
    data: accountResponse,
    isLoading: accountLoading,
    error: accountError,
  } = useQuery({
    queryKey: ['account', id],
    queryFn: () => apiClient.getAccount(id as string),
    enabled: !!id && isAuthenticated,
  });

  const account = accountResponse?.account;

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ['transactions', id, filterType, startDate, endDate],
    queryFn: () =>
      apiClient.getAccountTransactions(id as string, {
        type: filterType === 'all' ? undefined : filterType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    enabled: !!id && isAuthenticated,
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleExportCSV = () => {
    if (transactionsData?.transactions) {
      downloadCSV(transactionsData.transactions, `transactions-${id}.csv`);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (accountLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  if (accountError || transactionsError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-danger mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-500">
            Unable to load account or transaction data. Please try again later.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-900 focus:ring-gray-500 hover:bg-gray-200 p-2 rounded-md"
          >
            <ArrowLeftIcon className="h-3 w-3" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account?.accountType} Account</h1>
            <p className="text-gray-600">****{account?.accountNumber.slice(-4)}</p>
          </div>

          <Button onClick={handleExportCSV} disabled={!transactionsData?.transactions.length}>
            Export CSV
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Dropdown
                options={transactionTypeOptions}
                value={filterType}
                onChange={(value) => setFilterType(value as 'all' | 'debit' | 'credit')}
                placeholder="Select transaction type"
                size="md"
                label="Transaction Type"
              />
            </div>

            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
              />
            </div>

            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
              />
            </div>
          </div>
        </div>

        <TransactionsList
          transactions={transactionsData?.transactions || []}
          isLoading={transactionsLoading}
          hasMore={transactionsData?.hasMore || false}
        />
      </div>
    </Layout>
  );
}

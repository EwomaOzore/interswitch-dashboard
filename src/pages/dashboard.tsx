import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api-client';
import { Account } from '../lib/api';
import { AccountCard } from '../components/AccountCard';
import { Layout } from '../components/layout/Layout';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [filterType, setFilterType] = useState<Account['accountType'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'balance' | 'lastTransaction'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    data: accountsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      try {
        const result = await apiClient.getAccounts();
        return result;
      } catch (error) {
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  const accounts = accountsResponse?.accounts || [];

  const filteredAndSortedAccounts = React.useMemo(() => {
    let filtered = accounts;

    if (filterType !== 'all') {
      filtered = accounts.filter((account) => account.accountType === filterType);
    }

    return filtered.sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'balance') {
        compareValue = a.balance - b.balance;
      } else {
        compareValue =
          new Date(a.lastTransactionDate).getTime() - new Date(b.lastTransactionDate).getTime();
      }

      return sortOrder === 'desc' ? -compareValue : compareValue;
    });
  }, [accounts, filterType, sortBy, sortOrder]);

  React.useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const handleAccountClick = (account: Account) => {
    router.push(`/accounts/${account.id}/transactions`);
  };

  if (error) {
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Accounts</h3>
          <p className="text-gray-500">Unable to load your accounts. Please try again later.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
            <p className="text-gray-600">Manage your accounts and transactions</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4"> 
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as Account['accountType'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
            >
              <option value="all">All Accounts</option>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Loan">Loan</option>
            </select>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'balance' | 'lastTransaction')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
              >
                <option value="balance">Sort by Balance</option>
                <option value="lastTransaction">Sort by Last Transaction</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onClick={handleAccountClick}
              showBalance={true}
            />
          ))}
        </div>

        {filteredAndSortedAccounts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-500">No accounts match your current filters.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

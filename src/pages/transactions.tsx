import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { TransactionsList } from '../components/TransactionsList';
import { Transaction } from '../lib/api-client';

export default function TransactionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchTransactions = async () => {
      try {
        const mockTransactions = await import('../lib/mock-api').then((m) => m.mockTransactions);
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-interswitch-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-2">
            View all your transaction history and account activity
          </p>
        </div>

        <TransactionsList transactions={transactions} />
      </div>
    </Layout>
  );
}

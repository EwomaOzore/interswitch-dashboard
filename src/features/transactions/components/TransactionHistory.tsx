import React from 'react';
import { Transaction } from '../../../lib/api';
import { TransactionsList } from '../../../components/TransactionsList';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  title?: string;
}

export function TransactionHistory({
  transactions,
  isLoading,
  onLoadMore,
  hasMore,
  title = 'Transaction History',
}: Readonly<TransactionHistoryProps>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <div className="text-sm text-gray-500">{transactions.length} transactions</div>
      </div>

      <TransactionsList
        transactions={transactions}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
}

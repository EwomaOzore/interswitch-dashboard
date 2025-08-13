import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Transaction } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

interface TransactionItemProps {
  index: number;
  style: React.CSSProperties;
  data: Transaction[];
}

function TransactionItem({ index, style, data }: Readonly<TransactionItemProps>) {
  const transaction = data[index];

  return (
    <div style={style} className="px-4">
      <div className="border-b border-gray-100 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'credit'
                    ? 'bg-success bg-opacity-10'
                    : 'bg-danger bg-opacity-10'
                }`}
              >
                {transaction.type === 'credit' ? (
                  <ChevronUpIcon className="w-5 h-5 text-success" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-danger" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                  {transaction.reference && (
                    <p className="text-xs text-gray-400 font-mono">Ref: {transaction.reference}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p
              className={`text-sm font-semibold ${
                transaction.type === 'credit' ? 'text-success' : 'text-danger'
              }`}
            >
              {transaction.type === 'credit' ? '+' : '-'}
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Balance: {formatCurrency(transaction.balanceAfter)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TransactionsList({
  transactions,
  isLoading,
  onLoadMore,
  hasMore,
}: Readonly<TransactionsListProps>) {
  const memoizedTransactions = useMemo(() => transactions, [transactions]);

  if (isLoading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            📄
          </div>
          <h3 className="text-lg font-medium mb-2">No transactions found</h3>
          <p className="text-sm">No transactions match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Transaction History ({transactions.length} transactions)
        </h3>
      </div>

      <List
        height={600}
        width="100%"
        itemCount={transactions.length}
        itemSize={80}
        itemData={memoizedTransactions}
      >
        {TransactionItem}
      </List>

      {hasMore && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-interswitch-primary hover:text-interswitch-dark disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Loading...' : 'Load More Transactions'}
          </button>
        </div>
      )}
    </div>
  );
}

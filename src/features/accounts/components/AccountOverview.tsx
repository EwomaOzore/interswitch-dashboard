import React from 'react';
import { Account } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';

interface AccountOverviewProps {
  accounts: Account[];
  totalBalance: number;
  currency: string;
}

export function AccountOverview({ accounts, totalBalance, currency }: Readonly<AccountOverviewProps>) {
  const accountTypeCounts = accounts.reduce(
    (acc, account) => {
      acc[account.accountType] = (acc[account.accountType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-interswitch-primary">
            {formatCurrency(totalBalance, currency)}
          </div>
          <div className="text-sm text-gray-600">Total Balance</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{accounts.length}</div>
          <div className="text-sm text-gray-600">Total Accounts</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-success">
            {accounts.filter((acc) => acc.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Accounts</div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Account Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(accountTypeCounts).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{type}</span>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

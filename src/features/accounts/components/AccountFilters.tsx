import React from 'react';
import { AccountFilters, AccountSortOptions } from '../types';

interface AccountFiltersProps {
  filters: AccountFilters;
  sortOptions: AccountSortOptions;
  onFiltersChange: (filters: AccountFilters) => void;
  onSortChange: (sortOptions: AccountSortOptions) => void;
}

export function AccountFiltersComponent({
  filters,
  sortOptions,
  onFiltersChange,
  onSortChange,
}: Readonly<AccountFiltersProps>) {
  const handleFilterChange = (key: keyof AccountFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleSortChange = (field: AccountSortOptions['field']) => {
    const direction =
      sortOptions.field === field && sortOptions.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Filters & Sorting</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
          >
            <option value="">All Types</option>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
            <option value="Loan">Loan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="frozen">Frozen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Balance</label>
          <input
            type="number"
            value={filters.minBalance || ''}
            onChange={(e) =>
              handleFilterChange('minBalance', e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Balance</label>
          <input
            type="number"
            value={filters.maxBalance || ''}
            onChange={(e) =>
              handleFilterChange('maxBalance', e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="∞"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <div className="flex space-x-2">
          {(['balance', 'lastTransaction', 'accountType'] as const).map((field) => (
            <button
              key={field}
              onClick={() => handleSortChange(field)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                sortOptions.field === field
                  ? 'bg-interswitch-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {field === 'lastTransaction'
                ? 'Last Transaction'
                : field.charAt(0).toUpperCase() + field.slice(1)}
              {sortOptions.field === field && (
                <span className="ml-1">{sortOptions.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

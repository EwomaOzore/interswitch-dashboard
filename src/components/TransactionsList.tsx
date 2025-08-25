import React, { useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Transaction } from '../lib/api-client';
import { formatCurrency, formatDate } from '../lib/utils';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Dropdown, DropdownOption } from './ui/Dropdown';

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
    <div style={style} className="px-3">
      <div className="border-b border-gray-100 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  transaction.type === 'credit'
                    ? 'bg-success bg-opacity-10'
                    : 'bg-danger bg-opacity-10'
                }`}
              >
                {transaction.type === 'credit' ? (
                  <ChevronUpIcon className="w-3 h-3 text-success" />
                ) : (
                  <ChevronDownIcon className="w-3 h-3 text-danger" />
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
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'credit' 
                      ? 'bg-success bg-opacity-10 text-success' 
                      : 'bg-danger bg-opacity-10 text-danger'
                  }`}>
                    {transaction.category}
                  </span>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, selectedType, selectedCategory]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const uniqueCategories = useMemo(() => {
    const categories = transactions.map(t => t.category).filter(Boolean);
    return Array.from(new Set(categories)).sort((a, b) => a!.localeCompare(b!));
  }, [transactions]);

  const typeOptions: DropdownOption[] = [
    { value: 'all', label: 'All Types' },
    { value: 'credit', label: 'Credits' },
    { value: 'debit', label: 'Debits' },
  ];

  const categoryOptions: DropdownOption[] = [
    { value: 'all', label: 'All Categories' },
    ...uniqueCategories.map(category => ({ value: category!, label: category! })),
  ];

  const itemsPerPageOptions: DropdownOption[] = [
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' },
  ];

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: string | number) => {
    setItemsPerPage(Number(newItemsPerPage));
    setCurrentPage(1); 
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const handleFilterChange = () => {
    setCurrentPage(1); 
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedCategory]);

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
          <p className="text-sm">You don&apos;t have any transactions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions, reference, or category..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <Dropdown
              options={typeOptions}
              value={selectedType}
              onChange={(value) => {
                setSelectedType(value as string);
                handleFilterChange();
              }}
              size="sm"
              variant="outline"
              className="min-w-[120px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Dropdown
              options={categoryOptions}
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value as string);
                handleFilterChange();
              }}
              size="sm"
              variant="outline"
              className="min-w-[140px]"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Transaction History ({filteredTransactions.length} of {transactions.length} transactions)
          </h3>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
              Show:
            </label>
            <Dropdown
              options={itemsPerPageOptions}
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              size="sm"
              variant="outline"
              className="min-w-[100px]"
            />
          </div>
        </div>
      </div>

      {currentTransactions.length > 0 ? (
        <List
          height={600}
          width="100%"
          itemCount={currentTransactions.length}
          itemSize={80}
          itemData={currentTransactions}
        >
          {TransactionItem}
        </List>
      ) : (
        <div className="p-8 text-center">
          <div className="text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">🔎</div>
            <h3 className="text-lg font-medium mb-2">No transactions match your filters</h3>
            <p className="text-sm mb-4">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-interswitch-primary"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 mr-3">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-3 h-3" />
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                  disabled={page === '...'}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? 'bg-interswitch-primary text-white'
                      : page === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {hasMore && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-interswitch-primary hover:text-interswitch-dark disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Loading...' : 'Load More Transactions'}
          </button>
        </div>
      )} */}
    </div>
  );
}

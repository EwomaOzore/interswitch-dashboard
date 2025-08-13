import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Account, TransferRequest } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';

const TransferFormSchema = z.object({
  sourceAccountId: z.string().min(1, 'Please select a source account'),
  beneficiaryAccountNumber: z
    .string()
    .min(10, 'Account number must be at least 10 digits')
    .max(10, 'Account number must be exactly 10 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .transform((val) => parseFloat(val))
    .refine((val) => val > 0, 'Amount must be greater than 0')
    .refine((val) => val <= 1000000, 'Amount cannot exceed ₦1,000,000'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(140, 'Description cannot exceed 140 characters'),
  pin: z
    .string()
    .min(4, 'PIN must be 4 digits')
    .max(4, 'PIN must be 4 digits')
    .regex(/^\d+$/, 'PIN must contain only digits'),
});

type TransferFormData = z.infer<typeof TransferFormSchema>;

interface TransferFormProps {
  accounts: Account[];
  onSubmit: (data: TransferRequest) => Promise<void>;
  isLoading?: boolean;
}

export function TransferForm({ accounts, onSubmit, isLoading }: Readonly<TransferFormProps>) {
  const [showPin, setShowPin] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<TransferFormData>({
    resolver: zodResolver(TransferFormSchema),
    mode: 'onChange',
  });

  const sourceAccountId = watch('sourceAccountId');
  const amount = watch('amount');

  React.useEffect(() => {
    const account = accounts.find((acc) => acc.id === sourceAccountId);
    setSelectedAccount(account || null);
  }, [sourceAccountId, accounts]);

  const handleFormSubmit = async (data: TransferFormData) => {
    await onSubmit({
      sourceAccountId: data.sourceAccountId,
      beneficiaryAccountNumber: data.beneficiaryAccountNumber,
      amount: data.amount,
      description: data.description,
      pin: data.pin,
    });
    reset();
  };

  const isAmountValid = selectedAccount && amount && amount <= selectedAccount.balance;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="sourceAccountId" className="block text-sm font-medium text-gray-700 mb-2">
          From Account *
        </label>
        <select
          {...register('sourceAccountId')}
          id="sourceAccountId"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:border-transparent"
          aria-describedby={errors.sourceAccountId ? 'sourceAccountId-error' : undefined}
        >
          <option value="">Select account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.accountType} - ****{account.accountNumber.slice(-4)}(
              {formatCurrency(account.balance, account.currency)})
            </option>
          ))}
        </select>
        {errors.sourceAccountId && (
          <p id="sourceAccountId-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.sourceAccountId.message}
          </p>
        )}
      </div>

      {selectedAccount && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Available Balance:</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
            </span>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="beneficiaryAccountNumber"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          To Account Number *
        </label>
        <input
          {...register('beneficiaryAccountNumber')}
          type="text"
          id="beneficiaryAccountNumber"
          placeholder="Enter 10-digit account number"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:border-transparent"
          aria-describedby={
            errors.beneficiaryAccountNumber ? 'beneficiaryAccountNumber-error' : undefined
          }
        />
        {errors.beneficiaryAccountNumber && (
          <p id="beneficiaryAccountNumber-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.beneficiaryAccountNumber.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount (NGN) *
        </label>
        <input
          {...register('amount')}
          type="number"
          step="0.01"
          min="0"
          id="amount"
          placeholder="0.00"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:border-transparent ${
            amount && selectedAccount && amount > selectedAccount.balance
              ? 'border-danger'
              : 'border-gray-300'
          }`}
          aria-describedby={errors.amount ? 'amount-error' : undefined}
        />
        {errors.amount && (
          <p id="amount-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.amount.message}
          </p>
        )}
        {amount && selectedAccount && amount > selectedAccount.balance && (
          <p className="mt-1 text-sm text-danger" role="alert">
            Amount exceeds available balance
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          placeholder="Enter transfer description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:border-transparent resize-none"
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
          Transaction PIN *
        </label>
        <div className="relative">
          <input
            {...register('pin')}
            type={showPin ? 'text' : 'password'}
            id="pin"
            placeholder="Enter 4-digit PIN"
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:border-transparent"
            aria-describedby={errors.pin ? 'pin-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
          >
            {showPin ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.pin && (
          <p id="pin-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.pin.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid || !isAmountValid || isLoading}
        className="w-full bg-interswitch-primary text-white py-3 px-4 rounded-md font-medium hover:bg-interswitch-dark focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Transfer Funds'
        )}
      </button>
    </form>
  );
}

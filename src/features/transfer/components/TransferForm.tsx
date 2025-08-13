import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Account, TransferRequest } from '../../../lib/api-client';
import { formatCurrency } from '../../../lib/utils';
import { Dropdown, Input } from '../../../components/ui';
import { DropdownOption } from '../../../components/ui/Dropdown';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
    .regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
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
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
    trigger,
  } = useForm<TransferFormData>({
    resolver: zodResolver(TransferFormSchema),
    mode: 'onSubmit',
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



  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    e.target.value = numericValue;
    return numericValue;
  };

  const isAmountValid = selectedAccount && amount && amount <= selectedAccount.balance;

  const sourceAccountOptions: DropdownOption[] = accounts.map((account) => ({
    value: account.id,
    label: `${account.accountType} - ****${account.accountNumber.slice(-4)} (${formatCurrency(account.balance, account.currency)})`,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <Controller
          name="sourceAccountId"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Dropdown
                options={sourceAccountOptions}
                value={field.value || ''}
                onChange={(value) => {
                  field.onChange(value);
                }}
                placeholder="Select account"
                label="From Account *"
                size="md"
                error={fieldState.error?.message}
              />
              <input type="hidden" {...field} />
            </>
          )}
        />
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

      <Input
        label="To Account Number *"
        id="beneficiaryAccountNumber"
        type="text"
        placeholder="Enter 10-digit account number"
        error={errors.beneficiaryAccountNumber?.message}
        {...register('beneficiaryAccountNumber')}
      />

      <Input
        label="Amount (NGN) *"
        id="amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        error={errors.amount?.message}
        className={amount && selectedAccount && amount > selectedAccount.balance ? 'border-danger' : ''}
        {...register('amount')}
      />

      {amount && selectedAccount && amount > selectedAccount.balance && (
        <p className="mt-1 text-sm text-danger" role="alert">
          Amount exceeds available balance
        </p>
      )}

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
          <Controller
            name="pin"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type={showPin ? 'text' : 'password'}
                id="pin"
                placeholder="Enter 4-digit PIN"
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:border-transparent"
                onChange={(e) => {
                  const numericValue = handlePinChange(e);
                  field.onChange(numericValue);
                }}
                maxLength={4}
                inputMode="numeric"
                autoComplete="off"
              />
            )}
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-interswitch-primary focus:ring-offset-1 rounded"
            aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
          >
            {showPin ? (
              <EyeSlashIcon className="h-3 w-3" />
            ) : (
              <EyeIcon className="h-3 w-3" />
            )}
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

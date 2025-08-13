import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Account, TransferRequest } from '../../../lib/api-client';
import { formatCurrency } from '../../../lib/utils';
import { Dropdown, Input } from '../../../components/ui';
import { DropdownOption } from '../../../components/ui/Dropdown';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { validateAccountNumber } from '../../../lib/mock-api';

const TransferFormSchema = z.object({
  sourceAccountId: z.string().min(1, 'Please select a source account'),
  beneficiaryAccountNumber: z
    .string()
    .min(10, 'Account number must be at least 10 digits')
    .max(11, 'Account number must not exceed 11 digits')
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
  const [beneficiaryInfo, setBeneficiaryInfo] = useState<{
    accountHolderName?: string;
    bankName?: string;
    isValid?: boolean;
    isLoading?: boolean;
    error?: string;
  }>({});
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
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

  React.useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

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

  const handleBeneficiaryAccountChange = async (accountNumber: string) => {
    setBeneficiaryInfo({});

    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    if (accountNumber.length === 10 && /^\d+$/.test(accountNumber)) {
      setBeneficiaryInfo({ isLoading: true });

      const timeout = setTimeout(async () => {
        try {
          const result = await validateAccountNumber(accountNumber);
          setBeneficiaryInfo({
            accountHolderName: result.accountHolderName,
            bankName: result.bankName,
            isValid: result.isValid,
            error: result.error,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to validate account number:', error);
          setBeneficiaryInfo({
            error: 'Failed to validate account number',
            isLoading: false,
          });
        }
      }, 500);

      setValidationTimeout(timeout);
    }
  };

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
        inputMode="numeric"
        pattern="\\d*"
        maxLength={10}
        placeholder="Enter account number (up to 10 digits)"
        error={errors.beneficiaryAccountNumber?.message}
        {...register('beneficiaryAccountNumber', {
          onChange: (e) => {
            const sanitized = e.target.value.replace(/\D/g, '').slice(0, 11);
            e.target.value = sanitized;
            void handleBeneficiaryAccountChange(sanitized);
          },
        })}
      />

      {beneficiaryInfo.isLoading && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg
            className="animate-spin h-4 w-4 text-interswitch-primary"
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
          <span>Validating account number...</span>
        </div>
      )}

      {beneficiaryInfo.isValid && beneficiaryInfo.accountHolderName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Account Holder: {beneficiaryInfo.accountHolderName}
              </p>
              {beneficiaryInfo.bankName && (
                <p className="text-sm text-green-600">Bank: {beneficiaryInfo.bankName}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {beneficiaryInfo.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-800">{beneficiaryInfo.error}</p>
            </div>
          </div>
        </div>
      )}

      <Input
        label="Amount (NGN) *"
        id="amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        error={errors.amount?.message}
        className={
          amount && selectedAccount && amount > selectedAccount.balance ? 'border-danger' : ''
        }
        {...register('amount')}
      />

      {Boolean(amount && selectedAccount && amount > selectedAccount.balance) && (
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
            {showPin ? <EyeSlashIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
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

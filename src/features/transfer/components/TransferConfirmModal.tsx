import React from 'react';
import { Modal } from '../../../components/ui';
import { TransferRequest, Account } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';

interface TransferConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferData: TransferRequest | null;
  accounts: Account[];
  onConfirm: () => void;
  isLoading: boolean;
}

export function TransferConfirmModal({
  isOpen,
  onClose,
  transferData,
  accounts,
  onConfirm,
  isLoading,
}: Readonly<TransferConfirmModalProps>) {
  if (!transferData) return null;

  const sourceAccount = accounts.find((acc) => acc.id === transferData.sourceAccountId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Transfer">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Transfer Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span className="font-medium">
                {sourceAccount?.accountType} - ****{sourceAccount?.accountNumber.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="font-medium">{transferData.beneficiaryAccountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-lg text-interswitch-primary">
                {formatCurrency(transferData.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Description:</span>
              <span className="font-medium">{transferData.description}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Please review the transfer details carefully. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interswitch-primary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-interswitch-primary text-white px-4 py-2 rounded-md hover:bg-interswitch-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interswitch-primary disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Confirm Transfer'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, TransferRequest } from '../lib/api-client';
import { TransferForm } from '../features/transfer/components/TransferForm';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui';

export default function Transfer() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [transferData, setTransferData] = useState<TransferRequest | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const {
    data: accountsResponse,
    isLoading: accountsLoading,
    error: accountsError,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: apiClient.getAccounts,
    enabled: isAuthenticated,
  });

  const accounts = accountsResponse?.accounts || [];

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleTransferSubmit = async (data: TransferRequest) => {
    setTransferData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!transferData) return;

    setIsTransferring(true);
    try {
      const result = await apiClient.initiateTransfer(transferData);

      if (result.status === 'success') {
        router.push('/dashboard?transfer=success');
      } else {
        alert(`Transfer failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
      setIsConfirmModalOpen(false);
      setTransferData(null);
    }
  };

  if (accountsLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  if (accountsError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-danger mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Accounts</h3>
          <p className="text-gray-500">Unable to load your accounts. Please try again later.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Transfer Funds</h1>
          <p className="text-gray-600">Transfer money between your accounts or to other accounts</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <TransferForm
            accounts={accounts}
            onSubmit={handleTransferSubmit}
            isLoading={isTransferring}
          />
        </div>

        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirm Transfer"
        >
          {transferData && (
            <div className="space-y-4 max-w-md">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Transfer Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium">
                      {accounts.find((acc) => acc.id === transferData.sourceAccountId)?.accountType}{' '}
                      - ****
                      {accounts
                        .find((acc) => acc.id === transferData.sourceAccountId)
                        ?.accountNumber.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">{transferData.beneficiaryAccountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-lg text-interswitch-primary">
                      ₦{transferData.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium">{transferData.description}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interswitch-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  disabled={isTransferring}
                  className="flex-1 bg-interswitch-primary text-white px-4 py-2 rounded-md hover:bg-interswitch-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interswitch-primary disabled:opacity-50"
                >
                  {isTransferring ? 'Processing...' : 'Confirm Transfer'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, TransferRequest } from '../../../lib/api';

export function useTransfer() {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [transferData, setTransferData] = useState<TransferRequest | null>(null);
  const queryClient = useQueryClient();

  const transferMutation = useMutation({
    mutationFn: apiClient.initiateTransfer,
    onSuccess: (data) => {
      if (data.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        setIsConfirmModalOpen(false);
        setTransferData(null);
      }
    },
  });

  const initiateTransfer = (data: TransferRequest) => {
    setTransferData(data);
    setIsConfirmModalOpen(true);
  };

  const confirmTransfer = async () => {
    if (!transferData) return;

    try {
      await transferMutation.mutateAsync(transferData);
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  };

  const cancelTransfer = () => {
    setIsConfirmModalOpen(false);
    setTransferData(null);
  };

  return {
    isConfirmModalOpen,
    transferData,
    isTransferring: transferMutation.isPending,
    transferError: transferMutation.error,
    initiateTransfer,
    confirmTransfer,
    cancelTransfer,
  };
}

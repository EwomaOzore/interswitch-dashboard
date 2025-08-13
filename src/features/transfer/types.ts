export interface TransferFormData {
  sourceAccountId: string;
  beneficiaryAccountNumber: string;
  amount: number;
  description: string;
  pin: string;
}

export interface TransferConfirmationData {
  transferId: string;
  sourceAccount: string;
  beneficiaryAccount: string;
  amount: number;
  description: string;
  timestamp: Date;
}

export interface TransferStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  timestamp: Date;
}

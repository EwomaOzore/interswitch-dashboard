import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth-middleware';
import { TransferRequest } from '../../../lib/api';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'method_not_allowed',
      error_description: 'Only POST method is allowed' 
    });
  }

  try {
    const transferData: TransferRequest = req.body;

    // Validate required fields
    if (!transferData.sourceAccountId || !transferData.beneficiaryAccountNumber || 
        !transferData.amount || !transferData.description) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required fields',
      });
    }

    // Validate amount
    if (transferData.amount <= 0 || transferData.amount > 1000000) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Invalid amount. Must be between 0 and 1,000,000',
      });
    }

    // Validate account number format (10 digits)
    if (!/^\d{10}$/.test(transferData.beneficiaryAccountNumber)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Invalid beneficiary account number format',
      });
    }

    // Generate a mock transfer ID
    const transferId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // In a real application, this would:
    // 1. Validate the source account exists and has sufficient balance
    // 2. Validate the beneficiary account exists
    // 3. Process the transfer through the banking system
    // 4. Update account balances
    // 5. Create transaction records

    // Mock successful transfer
    return res.status(200).json({
      transferId,
      status: 'success',
      message: 'Transfer initiated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Transfer error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
}

export default withAuth(handler);

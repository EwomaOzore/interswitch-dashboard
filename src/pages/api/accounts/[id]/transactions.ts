import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../lib/auth-middleware';
import { mockApi } from '../../../../lib/api';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'method_not_allowed',
      error_description: 'Only GET method is allowed' 
    });
  }

  try {
    const { id } = req.query;
    const { type, startDate, endDate, page = '1', limit = '20' } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Account ID is required',
      });
    }

    // Find the account in mock data
    const account = mockApi.accounts.find(acc => acc.id === id);

    if (!account) {
      return res.status(404).json({
        error: 'not_found',
        error_description: 'Account not found',
      });
    }

    // Filter transactions based on query parameters
    let filteredTransactions = [...mockApi.transactions];

    // Filter by type (debit/credit)
    if (type && (type === 'debit' || type === 'credit')) {
      filteredTransactions = filteredTransactions.filter(txn => txn.type === type);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate as string);
      filteredTransactions = filteredTransactions.filter(txn => new Date(txn.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      filteredTransactions = filteredTransactions.filter(txn => new Date(txn.date) <= end);
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    return res.status(200).json({
      transactions: paginatedTransactions,
      totalCount: filteredTransactions.length,
      page: pageNum,
      limit: limitNum,
      hasMore: endIndex < filteredTransactions.length,
    });

  } catch (error) {
    console.error('Transactions error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
}

export default withAuth(handler);

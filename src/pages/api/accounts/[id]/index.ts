import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../lib/auth-middleware';
import { mockApi } from '../../../../lib/mock-api';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'method_not_allowed',
      error_description: 'Only GET method is allowed'
    });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Account ID is required',
      });
    }

    const account = mockApi.accounts.find(acc => acc.id === id);

    if (!account) {
      return res.status(404).json({
        error: 'not_found',
        error_description: 'Account not found',
      });
    }

    return res.status(200).json({
      account,
    });

  } catch (error) {
    console.error('Account details error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
}

export default withAuth(handler);

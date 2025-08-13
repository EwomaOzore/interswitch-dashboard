import type { NextApiResponse } from 'next';
import { mockApi } from '../../../lib/mock-api';

async function handler(req: any, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'method_not_allowed',
      error_description: 'Only GET method is allowed'
    });
  }

  try {
    return res.status(200).json({
      accounts: mockApi.accounts,
      totalCount: mockApi.accounts.length,
    });

  } catch (error) {
    console.error('Accounts error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
}

export default handler;

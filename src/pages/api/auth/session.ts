import type { NextApiRequest, NextApiResponse } from 'next';
import { SessionResponse, OAuth2Error } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse<SessionResponse | OAuth2Error>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'method_not_allowed',
      error_description: 'Only GET method is allowed'
    });
  }

  try {
    return res.status(200).json({
      authenticated: false,
    });

  } catch (error) {
    console.error('Session check error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
} 
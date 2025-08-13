import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAuthSession, getRefreshToken } from '../../../lib/auth-utils';
import { LogoutRequest, AuthResponse, OAuth2Error } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse | OAuth2Error>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      error_description: 'Only POST method is allowed'
    });
  }

  try {
    const { refresh_token }: LogoutRequest = req.body;

    if (refresh_token) {
      const storedRefreshToken = await getRefreshToken();
      if (storedRefreshToken !== refresh_token) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Invalid refresh token',
        });
      }
    }

    await clearAuthSession();

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
} 
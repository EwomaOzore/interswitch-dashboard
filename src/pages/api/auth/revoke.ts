import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAuthSession, getRefreshToken } from '../../../lib/auth-utils';
import { AuthResponse, OAuth2Error } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse | OAuth2Error>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      error_description: 'Only POST method is allowed'
    });
  }

  try {
    const { token, token_type_hint } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Token is required',
      });
    }

    if (token_type_hint && !['access_token', 'refresh_token'].includes(token_type_hint)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Invalid token_type_hint',
      });
    }

    const storedRefreshToken = await getRefreshToken();

    if (token_type_hint === 'refresh_token' || !token_type_hint) {
      if (storedRefreshToken === token) {
        await clearAuthSession();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Token revoked successfully',
    });

  } catch (error) {
    console.error('Token revocation error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
} 
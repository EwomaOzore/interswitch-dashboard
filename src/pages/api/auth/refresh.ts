import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getRefreshToken,
  storeRefreshToken,
  getUserById,
  checkRateLimit,
  createAuthSession
} from '../../../lib/auth-utils';
import { TokenRefreshRequest, AuthResponse, OAuth2Error } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse | OAuth2Error>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      error_description: 'Only POST method is allowed'
    });
  }

  try {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(`refresh:${clientIP}`, 10, 60000)) {
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        error_description: 'Too many refresh attempts. Please try again later.',
      });
    }

    const { refresh_token, grant_type = 'refresh_token' }: TokenRefreshRequest = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Refresh token is required',
      });
    }

    if (grant_type !== 'refresh_token') {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only refresh_token grant type is supported',
      });
    }

    const storedRefreshToken = await getRefreshToken();
    if (!storedRefreshToken || storedRefreshToken !== refresh_token) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'Invalid refresh token',
      });
    }

    const user = getUserById('1');
    if (!user) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'User not found',
      });
    }

    const newSession = createAuthSession(user);

    await storeRefreshToken(newSession.token.refresh_token);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
      },
      token: newSession.token,
      session: newSession,
      message: 'Token refreshed successfully',
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
} 
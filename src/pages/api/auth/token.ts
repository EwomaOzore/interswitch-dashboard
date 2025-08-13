import type { NextApiRequest, NextApiResponse } from 'next';
import {
  authenticateUser,
  createAuthSession,
  getRefreshToken,
  storeRefreshToken,
  generateOAuth2Token,
  getUserById,
  checkRateLimit
} from '../../../lib/auth-utils';
import { LoginRequest, TokenRefreshRequest, AuthResponse, OAuth2Error } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse | OAuth2Error>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      error_description: 'Only POST method is allowed'
    });
  }

  try {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(`token:${clientIP}`, 10, 60000)) {
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        error_description: 'Too many token requests. Please try again later.',
      });
    }

    const { grant_type } = req.body;

    switch (grant_type) {
      case 'password':
        return handlePasswordGrant(req, res);
      case 'refresh_token':
        return handleRefreshTokenGrant(req, res);
      default:
        return res.status(400).json({
          error: 'unsupported_grant_type',
          error_description: 'Unsupported grant type',
        });
    }

  } catch (error) {
    console.error('Token endpoint error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
}

async function handlePasswordGrant(req: NextApiRequest, res: NextApiResponse<AuthResponse | OAuth2Error>) {
  const { email, password }: LoginRequest = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Email and password are required',
    });
  }

  const user = authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({
      error: 'invalid_credentials',
      error_description: 'Invalid email or password',
    });
  }

  const session = createAuthSession(user);

  user.lastLogin = new Date().toISOString();

  return res.status(200).json({
    success: true,
    token: session.token,
    session: session,
    message: 'Token issued successfully',
  });
}

async function handleRefreshTokenGrant(req: NextApiRequest, res: NextApiResponse<AuthResponse | OAuth2Error>) {
  const { refresh_token }: TokenRefreshRequest = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Refresh token is required',
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

  const newToken = generateOAuth2Token(user);

  await storeRefreshToken(newToken.refresh_token);

  return res.status(200).json({
    success: true,
    token: newToken,
    message: 'Token refreshed successfully',
  });
} 
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser, createAuthSession, checkRateLimit } from '../../../lib/auth-utils';
import { LoginRequest, AuthResponse, OAuth2Error } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse | OAuth2Error>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'method_not_allowed',
      error_description: 'Only POST method is allowed' 
    });
  }

  try {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(`login:${clientIP}`, 5, 300000)) {
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        error_description: 'Too many login attempts. Please try again later.',
      });
    }

    const { email, password, grant_type = 'password' }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Email and password are required',
      });
    }

    if (grant_type !== 'password') {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only password grant type is supported',
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
      },
      token: session.token,
      session: session,
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
}

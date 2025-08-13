import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth-middleware';
import { OAuth2User, OAuth2Error } from '../../../types/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse<OAuth2User | OAuth2Error>) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'User not authenticated',
      });
    }

    return res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      permissions: req.user.permissions,
      lastLogin: req.user.lastLogin,
    });

  } catch (error) {
    console.error('Userinfo error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error',
    });
  }
}

export default withAuth(handler); 
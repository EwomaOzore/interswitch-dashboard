import { NextApiRequest, NextApiResponse } from 'next';
import { extractTokenFromHeader, validateToken, getUserById } from './auth-utils';
import { OAuth2User } from '../types/auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: OAuth2User;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          error: 'unauthorized',
          error_description: 'Authorization header is required',
        });
      }

      const token = extractTokenFromHeader(authHeader);
      
      if (!token) {
        return res.status(401).json({
          error: 'unauthorized',
          error_description: 'Invalid authorization header format',
        });
      }

      const isValid = validateToken(token);
      
      if (!isValid) {
        return res.status(401).json({
          error: 'invalid_token',
          error_description: 'Token is expired or invalid',
        });
      }

      const user = getUserById('1');
      
      if (!user) {
        return res.status(401).json({
          error: 'invalid_token',
          error_description: 'User not found',
        });
      }

      req.user = user;

      await handler(req, res);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({
        error: 'server_error',
        error_description: 'Internal server error',
      });
    }
  };
}

export function withPermission(
  permission: string,
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'User not authenticated',
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: `Permission '${permission}' is required`,
      });
    }

    return handler(req, res);
  });
}

export function withRole(
  role: string,
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'User not authenticated',
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: `Role '${role}' is required`,
      });
    }

    return handler(req, res);
  });
}

export function withOptionalAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader) {
        const token = extractTokenFromHeader(authHeader);
        if (token && validateToken(token)) {
          const user = getUserById('1');
          if (user) {
            req.user = user;
          }
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error('Optional authentication middleware error:', error);
      return handler(req, res);
    }
  };
} 
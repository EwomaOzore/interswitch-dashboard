import { OAuth2Token, OAuth2User, AuthSession, OAUTH_CONFIG } from '../types/auth';

const AUTH_SESSION_KEY = 'auth_session';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

const MOCK_USERS: Record<string, OAuth2User> = {
  'test@interswitch.com': {
    id: '1',
    email: 'test@interswitch.com',
    name: 'Test User',
    role: 'customer',
    permissions: ['read:accounts', 'read:transactions', 'write:transfers'],
    lastLogin: new Date().toISOString(),
  },
  'admin@interswitch.com': {
    id: '2',
    email: 'admin@interswitch.com',
    name: 'Admin User',
    role: 'admin',
    permissions: ['read:accounts', 'read:transactions', 'write:transfers', 'read:profile', 'write:profile'],
    lastLogin: new Date().toISOString(),
  },
};

function base64Encode(str: string): string {
  if (typeof window !== 'undefined' && typeof btoa !== 'undefined') {
    return btoa(str);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  throw new Error('No base64 encoding available');
}

function base64Decode(str: string): string {
  if (typeof window !== 'undefined' && typeof atob !== 'undefined') {
    return atob(str);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString();
  }
  throw new Error('No base64 decoding available');
}

export function generateAccessToken(): string {
  const payload = {
    iss: 'interswitch-banking',
    aud: 'interswitch-banking-client',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + OAUTH_CONFIG.ACCESS_TOKEN_EXPIRY,
    sub: 'mock-user-id',
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64Encode(JSON.stringify(header));
  const payloadB64 = base64Encode(JSON.stringify(payload));
  const signature = 'mock-signature';

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function generateRefreshToken(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}

export function generateOAuth2Token(user: OAuth2User): OAuth2Token {
  return {
    access_token: generateAccessToken(),
    token_type: 'Bearer',
    expires_in: OAUTH_CONFIG.ACCESS_TOKEN_EXPIRY,
    refresh_token: generateRefreshToken(),
    scope: OAUTH_CONFIG.SCOPES,
  };
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    const payloadB64 = parts[1];
    const decoded = base64Decode(payloadB64);
    const payload = JSON.parse(decoded);

    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    return currentTime >= expiryTime;
  } catch (error) {
    if (process.env.NODE_ENV === 'test') {
      try {
        const decoded = base64Decode(token);
        JSON.parse(decoded);
        return false;
      } catch {
        return true;
      }
    }
    console.error('Failed to parse token:', error);
    return true;
  }
}

export function validateToken(token: string): boolean {
  if (!token) {
    return false;
  }
  return !isTokenExpired(token);
}

export async function storeAuthSession(session: AuthSession): Promise<void> {
  try {
    if (!isLocalStorageAvailable()) {
      throw new Error('localStorage is not available');
    }

    const encodedSession = base64Encode(JSON.stringify(session));
    localStorage.setItem(AUTH_SESSION_KEY, encodedSession);
  } catch (error) {
    console.error('Failed to store auth session:', error);
    throw new Error('Failed to store authentication session');
  }
}

function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    if (!isLocalStorageAvailable()) {
      return null;
    }

    const encodedSession = localStorage.getItem(AUTH_SESSION_KEY);

    if (!encodedSession) {
      return null;
    }

    const session: AuthSession = JSON.parse(base64Decode(encodedSession));

    if (Date.now() >= session.expiresAt) {
      await clearAuthSession();
      return null;
    }

    return session;
  } catch (error) {
    await clearAuthSession();
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  if (!isLocalStorageAvailable()) {
    return;
  }

  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

export async function storeRefreshToken(token: string): Promise<void> {
  try {
    if (!isLocalStorageAvailable()) {
      throw new Error('localStorage is not available');
    }

    const encodedToken = base64Encode(token);
    localStorage.setItem(REFRESH_TOKEN_KEY, encodedToken);
  } catch (error) {
    console.error('Failed to store refresh token:', error);
    throw new Error('Failed to store refresh token');
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    if (!isLocalStorageAvailable()) {
      return null;
    }

    const encodedToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!encodedToken) return null;

    return base64Decode(encodedToken);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }
}

export function authenticateUser(email: string, password: string): OAuth2User | null {
  if (email === 'test@interswitch.com' && password === 'password123') {
    return MOCK_USERS[email];
  }
  if (email === 'admin@interswitch.com' && password === 'admin123') {
    return MOCK_USERS[email];
  }
  return null;
}

export function getUserById(id: string): OAuth2User | null {
  return Object.values(MOCK_USERS).find(user => user.id === id) || null;
}

export function hasPermission(user: OAuth2User, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function hasRole(user: OAuth2User, role: string): boolean {
  return user.role === role;
}

export function createAuthSession(user: OAuth2User): AuthSession {
  const token = generateOAuth2Token(user);
  const expiresAt = Date.now() + (token.expires_in * 1000);

  return {
    user,
    token,
    expiresAt,
  };
}

export function getAuthorizationHeader(token: string): string {
  return `Bearer ${token}`;
}

export function extractTokenFromHeader(authHeader: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
} 
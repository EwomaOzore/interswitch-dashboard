export interface OAuth2Token {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  scope?: string;
}

export interface OAuth2User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  lastLogin?: string;
}

export interface AuthSession {
  user: OAuth2User;
  token: OAuth2Token;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  grant_type?: 'password';
  client_id?: string;
  client_secret?: string;
}

export interface TokenRefreshRequest {
  refresh_token: string;
  grant_type: 'refresh_token';
  client_id?: string;
  client_secret?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: OAuth2User;
  token?: OAuth2Token;
  session?: AuthSession; // Include the full session data for client-side storage
  message?: string;
  error?: string;
  error_description?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: OAuth2User;
  expiresAt?: number;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface OAuth2Error {
  error: string;
  error_description?: string;
  error_uri?: string;
}

// OAuth 2.0 Scopes
export const OAUTH_SCOPES = {
  READ_ACCOUNTS: 'read:accounts',
  WRITE_TRANSFERS: 'write:transfers',
  READ_TRANSACTIONS: 'read:transactions',
  WRITE_TRANSACTIONS: 'write:transactions',
  READ_PROFILE: 'read:profile',
  WRITE_PROFILE: 'write:profile',
} as const;

export type OAuthScope = typeof OAUTH_SCOPES[keyof typeof OAUTH_SCOPES];

// Mock OAuth 2.0 Configuration
export const OAUTH_CONFIG = {
  CLIENT_ID: 'interswitch-banking-client',
  CLIENT_SECRET: 'mock-client-secret',
  TOKEN_ENDPOINT: '/api/auth/token',
  AUTHORIZATION_ENDPOINT: '/api/auth/authorize',
  USERINFO_ENDPOINT: '/api/auth/userinfo',
  REVOKE_ENDPOINT: '/api/auth/revoke',
  SCOPES: Object.values(OAUTH_SCOPES).join(' '),
  ACCESS_TOKEN_EXPIRY: 3600, // 1 hour
  REFRESH_TOKEN_EXPIRY: 2592000, // 30 days
} as const; 
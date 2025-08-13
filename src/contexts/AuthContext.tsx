import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { OAuth2User, AuthResponse } from '../types/auth';
import {
  storeAuthSession,
  getAuthSession,
  clearAuthSession,
  getRefreshToken,
} from '../lib/auth-utils';

interface AuthState {
  user: OAuth2User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          grant_type: 'password',
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Login failed');
      }

      if (data.success && data.user && data.token && data.session) {
        await storeAuthSession(data.session);

        const newAuthState = {
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };

        setAuthState(newAuthState);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuthSession();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: storedRefreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Token refresh failed');
      }

      if (data.success && data.token) {
        const currentSession = await getAuthSession();
        if (currentSession) {
          await storeAuthSession({
            ...currentSession,
            token: data.token,
            expiresAt: Date.now() + data.token.expires_in * 1000,
          });
        }

        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  }, [logout]);

  const checkSession = useCallback(async () => {
    try {
      const session = await getAuthSession();

      if (session && session.user) {
        setAuthState({
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshToken,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

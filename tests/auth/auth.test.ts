import { authenticateUser, generateOAuth2Token, validateToken, isTokenExpired } from '../../src/lib/auth-utils';
import { OAuth2User } from '../../src/types/auth';

describe('Authentication System', () => {
  describe('User Authentication', () => {
    it('should authenticate valid user credentials', () => {
      const user = authenticateUser('test@interswitch.com', 'password123');
      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@interswitch.com');
      expect(user?.name).toBe('Test User');
      expect(user?.role).toBe('customer');
    });

    it('should reject invalid credentials', () => {
      const user = authenticateUser('invalid@email.com', 'wrongpassword');
      expect(user).toBeNull();
    });

    it('should authenticate admin user', () => {
      const user = authenticateUser('admin@interswitch.com', 'admin123');
      expect(user).toBeTruthy();
      expect(user?.role).toBe('admin');
      expect(user?.permissions).toContain('read:profile');
    });
  });

  describe('Token Generation', () => {
    it('should generate valid OAuth 2.0 tokens', () => {
      const mockUser: OAuth2User = {
        id: '1',
        email: 'test@interswitch.com',
        name: 'Test User',
        role: 'customer',
        permissions: ['read:accounts'],
      };

      const token = generateOAuth2Token(mockUser);
      
      expect(token).toHaveProperty('access_token');
      expect(token).toHaveProperty('refresh_token');
      expect(token).toHaveProperty('token_type', 'Bearer');
      expect(token).toHaveProperty('expires_in');
      expect(token).toHaveProperty('scope');
    });

    it('should generate unique refresh tokens', () => {
      const mockUser: OAuth2User = {
        id: '1',
        email: 'test@interswitch.com',
        name: 'Test User',
        role: 'customer',
        permissions: ['read:accounts'],
      };

      const token1 = generateOAuth2Token(mockUser);
      const token2 = generateOAuth2Token(mockUser);

      expect(token1.refresh_token).not.toBe(token2.refresh_token);
      expect(typeof token1.refresh_token).toBe('string');
      expect(token1.refresh_token.length).toBeGreaterThan(10);
    });
  });

  describe('Token Validation', () => {
    it('should validate non-expired tokens', () => {
      // Create a token that expires in the future
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = {
        iss: 'interswitch-banking',
        aud: 'interswitch-banking-client',
        iat: Math.floor(Date.now() / 1000),
        exp: futureTime,
        sub: 'mock-user-id',
      };
      const token = btoa(JSON.stringify(payload));
      
      expect(validateToken(token)).toBe(true);
    });

    it('should reject expired tokens', () => {
      // Create a token that has already expired
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = {
        iss: 'interswitch-banking',
        aud: 'interswitch-banking-client',
        iat: Math.floor(Date.now() / 1000),
        exp: pastTime,
        sub: 'mock-user-id',
      };
      const expiredToken = btoa(JSON.stringify(payload));
      
      expect(validateToken(expiredToken)).toBe(false);
    });

    it('should reject invalid tokens', () => {
      expect(validateToken('')).toBe(false);
      expect(validateToken('invalid-token')).toBe(false);
    });
  });

  describe('Token Expiry', () => {
    it('should detect expired tokens', () => {
      // Create a token that has already expired
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = {
        iss: 'interswitch-banking',
        aud: 'interswitch-banking-client',
        iat: Math.floor(Date.now() / 1000),
        exp: pastTime,
        sub: 'mock-user-id',
      };
      const expiredToken = btoa(JSON.stringify(payload));
      
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it('should detect non-expired tokens', () => {
      // Create a token that expires in the future
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = {
        iss: 'interswitch-banking',
        aud: 'interswitch-banking-client',
        iat: Math.floor(Date.now() / 1000),
        exp: futureTime,
        sub: 'mock-user-id',
      };
      const validToken = btoa(JSON.stringify(payload));
      
      expect(isTokenExpired(validToken)).toBe(false);
    });
  });
}); 
import { authenticateUser, createAuthSession, storeAuthSession, getAuthSession } from '../../src/lib/auth-utils';

describe('Login Integration Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should complete full login flow successfully', async () => {
    // Step 1: Authenticate user
    const user = authenticateUser('test@interswitch.com', 'password123');
    expect(user).toBeTruthy();
    expect(user?.email).toBe('test@interswitch.com');

    // Step 2: Create session
    const session = createAuthSession(user!);
    expect(session).toBeTruthy();
    expect(session.user).toBe(user);
    expect(session.token).toBeTruthy();

    // Step 3: Store session
    await storeAuthSession(session);
    
    // Step 4: Retrieve session
    const retrievedSession = await getAuthSession();
    expect(retrievedSession).toBeTruthy();
    expect(retrievedSession?.user.email).toBe('test@interswitch.com');
    expect(retrievedSession?.token.access_token).toBe(session.token.access_token);
  });

  it('should reject invalid credentials', () => {
    const user = authenticateUser('invalid@email.com', 'wrongpassword');
    expect(user).toBeNull();
  });

  it('should handle admin user login', () => {
    const user = authenticateUser('admin@interswitch.com', 'admin123');
    expect(user).toBeTruthy();
    expect(user?.role).toBe('admin');
    expect(user?.permissions).toContain('read:profile');
  });
}); 
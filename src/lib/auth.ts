import { encryptSensitiveData, decryptSensitiveData } from './utils';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

export async function storeAuthToken(token: string): Promise<void> {
  try {
    const encryptedToken = await encryptSensitiveData(token);
    localStorage.setItem(AUTH_TOKEN_KEY, encryptedToken);
  } catch (error) {
    console.error('Failed to store auth token:', error);
    throw new Error('Failed to securely store authentication token');
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const encryptedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!encryptedToken) return null;

    return await decryptSensitiveData(encryptedToken);
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }
}

export async function storeRefreshToken(token: string): Promise<void> {
  try {
    const encryptedToken = await encryptSensitiveData(token);
    localStorage.setItem(REFRESH_TOKEN_KEY, encryptedToken);
  } catch (error) {
    console.error('Failed to store refresh token:', error);
    throw new Error('Failed to securely store refresh token');
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const encryptedToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!encryptedToken) return null;

    return await decryptSensitiveData(encryptedToken);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return null;
  }
}

export function storeUserData(userData: any): void {
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
}

export function getUserData(): any {
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    localStorage.removeItem(USER_DATA_KEY);
    return null;
  }
}

export function clearAuthData(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error('Failed to parse token:', error);
    return true;
  }
}

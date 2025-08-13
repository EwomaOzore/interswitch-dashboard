import { encryptSensitiveData, decryptSensitiveData } from './utils';

export interface SecureStorage {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): void;
  clear(): void;
}

class EncryptedStorage implements SecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    try {
      const encryptedValue = await encryptSensitiveData(value);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error(`Failed to encrypt and store value for key: ${key}`, error);
      throw new Error('Failed to securely store data');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;

      return await decryptSensitiveData(encryptedValue);
    } catch (error) {
      console.error(`Failed to decrypt value for key: ${key}`, error);
      localStorage.removeItem(key);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

export class SessionStorage {
  private readonly storage: SecureStorage;

  constructor() {
    this.storage = new EncryptedStorage();
  }

  async setItem(key: string, value: string): Promise<void> {
    return this.storage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage.getItem(key);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

export class LocalStorage {
  private readonly storage: SecureStorage;

  constructor() {
    this.storage = new EncryptedStorage();
  }

  async setItem(key: string, value: string): Promise<void> {
    return this.storage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage.getItem(key);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

export const secureSessionStorage = new SessionStorage();
export const secureLocalStorage = new LocalStorage();

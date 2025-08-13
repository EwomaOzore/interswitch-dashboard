import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length < 4) return accountNumber;
  const masked = '*'.repeat(accountNumber.length - 4);
  return masked + accountNumber.slice(-4);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function downloadCSV(data: any[], filename: string) {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        })
        .join(',')
    ),
  ];

  return csvRows.join('\n');
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `TXN_${timestamp}_${randomPart}`.toUpperCase();
}

export function validateAccountNumber(accountNumber: string): boolean {
  const cleaned = accountNumber.replace(/\D/g, '');
  return cleaned.length === 10;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+234${cleaned.slice(1)}`;
  }
  if (cleaned.length === 10) {
    return `+234${cleaned}`;
  }
  return phone;
}

export function encryptSensitiveData(data: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
        'encrypt',
      ]);

      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataBuffer);

      const encryptedArray = new Uint8Array(encryptedData);

      const base64 = btoa(String.fromCharCode(...encryptedArray));
      resolve(base64);
    } catch (error) {
      reject(error);
    }
  });
}

export function decryptSensitiveData(encryptedData: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const decoder = new TextDecoder();
      const encryptedArray = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map((char) => char.charCodeAt(0))
      );

      const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
        'decrypt',
      ]);

      const iv = encryptedArray.slice(0, 12);
      const data = encryptedArray.slice(12);

      const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);

      const decryptedText = decoder.decode(decryptedData);
      resolve(decryptedText);
    } catch (error) {
      reject(error);
    }
  });
}

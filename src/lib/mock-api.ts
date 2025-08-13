import { Account, Transaction } from './api-client';

export const mockAccounts: Account[] = [
  {
    id: '1',
    accountNumber: '1234567890',
    accountType: 'Savings',
    balance: 150000.5,
    currency: 'NGN',
    lastTransactionDate: '2024-01-10T10:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    accountNumber: '0987654321',
    accountType: 'Current',
    balance: 75000.25,
    currency: 'NGN',
    lastTransactionDate: '2024-01-09T14:15:00Z',
    status: 'active',
  },
  {
    id: '3',
    accountNumber: '1122334455',
    accountType: 'Loan',
    balance: -250000.0,
    currency: 'NGN',
    lastTransactionDate: '2024-01-05T09:00:00Z',
    status: 'inactive',
  },
];

const generateTransactions = (): Transaction[] => {
  const transactionTypes = ['debit', 'credit'];
  const categories = [
    'Shopping', 'Food & Dining', 'Transportation', 'Entertainment',
    'Healthcare', 'Education', 'Utilities', 'Insurance', 'Investment',
    'Salary', 'Freelance', 'Refund', 'Transfer', 'ATM Withdrawal',
    'Online Services', 'Subscriptions', 'Travel', 'Gifts'
  ];

  const descriptions = [
    'Online Purchase - Amazon', 'Salary Credit', 'ATM Withdrawal', 'Food Delivery',
    'Uber Ride', 'Netflix Subscription', 'Electricity Bill', 'Phone Bill',
    'Internet Service', 'Grocery Shopping', 'Restaurant Payment', 'Fuel Purchase',
    'Movie Tickets', 'Shopping Mall', 'Online Banking Fee', 'Insurance Premium',
    'Investment Deposit', 'Freelance Payment', 'Refund - Return', 'Bank Transfer',
    'International Transfer', 'Loan Payment', 'Credit Card Payment', 'Savings Deposit',
    'Emergency Fund', 'Travel Booking', 'Hotel Payment', 'Flight Tickets',
    'Car Maintenance', 'Medical Bills', 'Pharmacy', 'Dental Care',
    'Gym Membership', 'Fitness Classes', 'Books Purchase', 'Course Payment',
    'Software License', 'Cloud Services', 'Domain Registration', 'Web Hosting',
    'Mobile App Purchase', 'Game Purchase', 'Music Subscription', 'Video Streaming',
    'News Subscription', 'Magazine', 'Newspaper', 'Podcast Support',
    'Charity Donation', 'Church Offering', 'Political Donation', 'Fundraiser',
    'Pet Care', 'Veterinary', 'Pet Food', 'Pet Supplies', 'Pet Insurance',
    'Home Maintenance', 'Repairs', 'Furniture', 'Appliances', 'Decorations',
    'Garden Supplies', 'Tools', 'Hardware', 'Paint', 'Cleaning Supplies'
  ];

  const transactions: Transaction[] = [];
  let currentBalance = 150000.5;
  let date = new Date('2024-01-01');

  for (let i = 1; i <= 150; i++) {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)] as 'debit' | 'credit';
    const category = categories[Math.floor(Math.random() * categories.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    let amount: number;
    if (type === 'credit') {
      amount = Math.floor(Math.random() * 50000) + 1000;
    } else {
      amount = Math.floor(Math.random() * 25000) + 100;
    }

    if (type === 'credit') {
      currentBalance += amount;
    } else {
      currentBalance -= amount;
    }

    const randomDays = Math.floor(Math.random() * 180);
    const transactionDate = new Date(date);
    transactionDate.setDate(date.getDate() - randomDays);

    transactions.push({
      id: i.toString(),
      date: transactionDate.toISOString(),
      description,
      amount: type === 'credit' ? amount : -amount,
      type,
      balanceAfter: currentBalance,
      reference: `TXN${i.toString().padStart(3, '0')}`,
      category,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockTransactions: Transaction[] = generateTransactions();

export const mockApi = {
  accounts: mockAccounts,
  transactions: mockTransactions,
};

const mockAccountHolders: Record<string, string> = {
  '1234567890': 'John Doe',
  '0987654321': 'Jane Smith',
  '1122334455': 'Michael Johnson',
  '5566778899': 'Sarah Williams',
  '9988776655': 'David Brown',
  '4433221100': 'Lisa Davis',
  '6677889900': 'Robert Wilson',
  '5544332211': 'Amanda Taylor',
  '2233445566': 'Grace Okafor',
  '3344556677': 'Hassan Ibrahim',
};

export const validateAccountNumber = async (accountNumber: string): Promise<{
  isValid: boolean;
  accountHolderName?: string;
  bankName?: string;
  error?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const accountHolderName = mockAccountHolders[accountNumber];

  if (accountHolderName) {
    return {
      isValid: true,
      accountHolderName,
      bankName: 'Interswitch Bank',
    };
  }

  if (accountNumber.length === 10 && /^\d+$/.test(accountNumber)) {
    const names = [
      'Adebayo Okechukwu', 'Chioma Nwachukwu', 'Emeka Okonkwo', 'Fatima Hassan',
      'Grace Okafor', 'Hassan Ibrahim', 'Ibrahim Mohammed', 'Joyce Okonkwo',
      'Kemi Adebayo', 'Lola Okechukwu', 'Mohammed Ali', 'Ngozi Eze',
      'Oluwaseun Adebayo', 'Patience Okonkwo', 'Queen Okafor', 'Rashid Ahmed',
      'Sade Okechukwu', 'Tunde Adebayo', 'Uche Okonkwo', 'Victoria Okafor'
    ];

    const randomName = names[Math.floor(Math.random() * names.length)];

    return {
      isValid: true,
      accountHolderName: randomName,
      bankName: 'Interswitch Bank',
    };
  }

  return {
    isValid: false,
    error: 'Invalid account number format',
  };
};

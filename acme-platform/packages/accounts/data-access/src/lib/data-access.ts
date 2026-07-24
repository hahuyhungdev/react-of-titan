export interface Account {
  id: string;
  accountNumber: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Investment';
  balance: number;
  currency: string;
  status: 'Active' | 'Frozen';
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  timestamp: string;
  category: string;
}

export async function fetchAccounts(): Promise<Account[]> {
  return [
    {
      id: 'acc-1',
      accountNumber: '•••• 4821',
      name: 'Primary Checking',
      type: 'Checking',
      balance: 14850.50,
      currency: 'USD',
      status: 'Active',
    },
    {
      id: 'acc-2',
      accountNumber: '•••• 9104',
      name: 'High Yield Savings',
      type: 'Savings',
      balance: 38200.00,
      currency: 'USD',
      status: 'Active',
    },
    {
      id: 'acc-3',
      accountNumber: '•••• 3390',
      name: 'Wealth Investment Portfolio',
      type: 'Investment',
      balance: 125400.75,
      currency: 'USD',
      status: 'Active',
    },
  ];
}

export async function fetchRecentTransactions(accountId?: string): Promise<Transaction[]> {
  const transactions: Transaction[] = [
    {
      id: 'txn-101',
      accountId: 'acc-1',
      description: 'Payroll Direct Deposit - Tech Corp',
      amount: 4200.00,
      type: 'credit',
      timestamp: '2026-07-23 09:15',
      category: 'Income',
    },
    {
      id: 'txn-102',
      accountId: 'acc-1',
      description: 'Internal Transfer to Savings',
      amount: 1000.00,
      type: 'debit',
      timestamp: '2026-07-22 14:30',
      category: 'Transfer',
    },
    {
      id: 'txn-103',
      accountId: 'acc-1',
      description: 'Coffee & Bakers Market',
      amount: 14.50,
      type: 'debit',
      timestamp: '2026-07-22 11:05',
      category: 'Dining',
    },
  ];

  if (accountId) {
    return transactions.filter((t) => t.accountId === accountId);
  }
  return transactions;
}

import { fetchAccounts, fetchRecentTransactions } from './data-access';

describe('Accounts Data Access', () => {
  it('should fetch accounts list with valid balances', async () => {
    const accounts = await fetchAccounts();
    expect(accounts).toHaveLength(3);
    expect(accounts[0].name).toBe('Primary Checking');
    expect(accounts[0].balance).toBeGreaterThan(0);
  });

  it('should fetch recent transactions', async () => {
    const txns = await fetchRecentTransactions();
    expect(txns.length).toBeGreaterThan(0);
    expect(txns[0]).toHaveProperty('description');
  });
});

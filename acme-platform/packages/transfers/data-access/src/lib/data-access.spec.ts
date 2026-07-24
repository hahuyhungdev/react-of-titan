import { executeTransfer } from './data-access';

describe('Transfers Data Access', () => {
  it('should execute transfer successfully for positive amount', async () => {
    const result = await executeTransfer({
      fromAccount: 'ACC-1',
      toAccount: 'ACC-2',
      amount: 150,
    });
    expect(result.success).toBe(true);
    expect(result.reference).toMatch(/^TXN-\d{6}$/);
  });

  it('should fail transfer for zero or negative amount', async () => {
    const result = await executeTransfer({
      fromAccount: 'ACC-1',
      toAccount: 'ACC-2',
      amount: 0,
    });
    expect(result.success).toBe(false);
  });
});

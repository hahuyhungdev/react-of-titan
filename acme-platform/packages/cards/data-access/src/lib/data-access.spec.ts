import { fetchCreditCards, toggleCardStatus } from './data-access';

describe('Cards Data Access', () => {
  it('should fetch credit cards with limit and balances', async () => {
    const cards = await fetchCreditCards();
    expect(cards).toHaveLength(2);
    expect(cards[0].creditLimit).toBeGreaterThan(0);
  });

  it('should toggle card status correctly', async () => {
    const newStatus = await toggleCardStatus('card-01', 'active');
    expect(newStatus).toBe('frozen');
  });
});

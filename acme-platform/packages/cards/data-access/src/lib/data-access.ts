export interface CreditCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  cardType: 'Visa Infinite' | 'World Elite Mastercard';
  creditLimit: number;
  currentBalance: number;
  expiry: string;
  status: 'active' | 'frozen';
}

export async function fetchCreditCards(): Promise<CreditCard[]> {
  return [
    {
      id: 'card-01',
      cardNumber: '•••• •••• •••• 8821',
      cardHolder: 'ALEXANDER M. VANCE',
      cardType: 'Visa Infinite',
      creditLimit: 25000,
      currentBalance: 3420.80,
      expiry: '08/29',
      status: 'active',
    },
    {
      id: 'card-02',
      cardNumber: '•••• •••• •••• 4409',
      cardHolder: 'ALEXANDER M. VANCE',
      cardType: 'World Elite Mastercard',
      creditLimit: 15000,
      currentBalance: 850.00,
      expiry: '11/27',
      status: 'active',
    },
  ];
}

export async function toggleCardStatus(cardId: string, currentStatus: 'active' | 'frozen'): Promise<'active' | 'frozen'> {
  // Simulate card freeze/unfreeze API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  return currentStatus === 'active' ? 'frozen' : 'active';
}

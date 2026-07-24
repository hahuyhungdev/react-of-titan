import { render, screen, waitFor } from '@testing-library/react';
import { CardsFeature } from './feature';

describe('CardsFeature', () => {
  it('should render credit cards and freeze buttons', async () => {
    render(<CardsFeature />);
    expect(screen.getByText(/loading credit cards/i)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Credit Cards & Spending Limits')).toBeTruthy();
      expect(screen.getByText('ALEXANDER M. VANCE')).toBeTruthy();
    });
  });
});

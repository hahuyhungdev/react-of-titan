import { render, screen, waitFor } from '@testing-library/react';
import { AccountsFeature } from './feature';

describe('AccountsFeature', () => {
  it('should render accounts overview and recent activity', async () => {
    render(<AccountsFeature />);
    expect(screen.getByText(/loading accounts summary/i)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Accounts & Financial Overview')).toBeTruthy();
      expect(screen.getByText('Primary Checking')).toBeTruthy();
    });
  });
});

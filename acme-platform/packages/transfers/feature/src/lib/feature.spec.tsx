import { render, screen } from '@testing-library/react';
import { TransfersFeature } from './feature';

describe('TransfersFeature', () => {
  it('should render transfer form elements correctly', () => {
    render(<TransfersFeature />);
    expect(screen.getByText('Fast & Secure Money Transfers')).toBeTruthy();
    expect(screen.getByRole('button', { name: /confirm & transfer funds/i })).toBeTruthy();
  });
});

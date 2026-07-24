import { render, screen } from '@testing-library/react';
import { Button, Card, Badge, StatWidget, Input } from './ui';

describe('Banking UI Primitives', () => {
  it('should render Button successfully', () => {
    render(<Button variant="primary">Transfer Money</Button>);
    expect(screen.getByRole('button', { name: /transfer money/i })).toBeTruthy();
  });

  it('should render Card with Badge successfully', () => {
    render(
      <Card title="Checking Account" badge={<Badge variant="success">Active</Badge>}>
        $12,450.00
      </Card>
    );
    expect(screen.getByText('Checking Account')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('$12,450.00')).toBeTruthy();
  });

  it('should render StatWidget and Input', () => {
    render(
      <>
        <StatWidget label="Total Balance" value="$54,320.00" />
        <Input label="Recipient Account" placeholder="ACC-123456" />
      </>
    );
    expect(screen.getByText('Total Balance')).toBeTruthy();
    expect(screen.getByText('$54,320.00')).toBeTruthy();
    expect(screen.getByText('Recipient Account')).toBeTruthy();
  });
});

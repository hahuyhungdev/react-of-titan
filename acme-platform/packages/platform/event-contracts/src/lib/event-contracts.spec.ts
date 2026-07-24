import { PlatformEventBus } from './event-contracts';

describe('PlatformEventBus Banking Contracts', () => {
  it('should emit and listen to transfer:completed event', () => {
    const eventBus = PlatformEventBus.getInstance();
    const receivedPayloads: any[] = [];

    const unsubscribe = eventBus.subscribe('transfer:completed', (payload) => {
      receivedPayloads.push(payload);
    });

    eventBus.emit('transfer:completed', {
      fromAccount: 'ACC-1001',
      toAccount: 'ACC-2002',
      amount: 500,
      reference: 'TXN-998811',
      timestamp: '2026-07-24T10:40:00Z',
    });

    expect(receivedPayloads).toHaveLength(1);
    expect(receivedPayloads[0]).toEqual({
      fromAccount: 'ACC-1001',
      toAccount: 'ACC-2002',
      amount: 500,
      reference: 'TXN-998811',
      timestamp: '2026-07-24T10:40:00Z',
    });

    unsubscribe();
  });
});

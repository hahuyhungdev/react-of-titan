export interface PlatformEvents {
  'transfer:completed': {
    fromAccount: string;
    toAccount: string;
    amount: number;
    reference: string;
    timestamp: string;
  };
  'card:toggled': {
    cardId: string;
    status: 'active' | 'frozen';
  };
  'account:selected': {
    accountId: string;
  };
  'auth:session-expired': {
    reason: 'expired' | 'revoked';
  };
}

export class PlatformEventBus {
  private static instance: PlatformEventBus;

  private constructor() {}

  public static getInstance(): PlatformEventBus {
    if (!PlatformEventBus.instance) {
      PlatformEventBus.instance = new PlatformEventBus();
    }
    return PlatformEventBus.instance;
  }

  public emit<K extends keyof PlatformEvents>(event: K, payload: PlatformEvents[K]): void {
    const eventName = `nexus-bank:${event}`;
    // Dispatch native DOM custom event for micro-frontend crossing boundaries
    const domEvent = new CustomEvent(eventName, { detail: payload });
    window.dispatchEvent(domEvent);
  }

  public subscribe<K extends keyof PlatformEvents>(
    event: K,
    callback: (payload: PlatformEvents[K]) => void
  ): () => void {
    const eventName = `nexus-bank:${event}`;
    const domHandler = (e: Event) => {
      const customEvent = e as CustomEvent<PlatformEvents[K]>;
      callback(customEvent.detail);
    };

    window.addEventListener(eventName, domHandler);

    return () => {
      window.removeEventListener(eventName, domHandler);
    };
  }
}

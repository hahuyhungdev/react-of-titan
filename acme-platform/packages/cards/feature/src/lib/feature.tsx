import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, StatWidget } from '@acme-platform/ui';
import { fetchCreditCards, toggleCardStatus, CreditCard } from '@acme-platform/cards-data-access';
import { PlatformEventBus } from '@acme-platform/event-contracts';
import styles from './feature.module.css';

export const CardsFeature: React.FC = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditCards().then((data) => {
      setCards(data);
      setLoading(false);
    });
  }, []);

  const handleToggleStatus = async (card: CreditCard) => {
    setTogglingId(card.id);
    const newStatus = await toggleCardStatus(card.id, card.status);

    setCards((prevCards) =>
      prevCards.map((c) => (c.id === card.id ? { ...c, status: newStatus } : c))
    );
    setTogglingId(null);

    // Emit event to bus
    const eventBus = PlatformEventBus.getInstance();
    eventBus.emit('card:toggled', {
      cardId: card.id,
      status: newStatus,
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading credit cards...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Credit Cards & Spending Limits</h2>
        <Badge variant="success">MFE Remote: Cards</Badge>
      </div>

      <div className={styles.cardsGrid}>
        {cards.map((card) => (
          <Card
            key={card.id}
            title={card.cardType}
            className={styles.cardItem}
            badge={
              <Badge variant={card.status === 'active' ? 'success' : 'danger'}>
                {card.status === 'active' ? 'Active' : 'Frozen'}
              </Badge>
            }
          >
            <div className={styles.cardNumber}>{card.cardNumber}</div>
            <div className={styles.cardMeta}>
              <span>Holder: {card.cardHolder}</span>
              <span>Expires: {card.expiry}</span>
            </div>

            <div className={styles.cardActions}>
              <StatWidget
                label="Used Credit"
                value={`$${card.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} / $${card.creditLimit.toLocaleString('en-US')}`}
              />
              <Button
                variant={card.status === 'active' ? 'danger' : 'secondary'}
                disabled={togglingId === card.id}
                onClick={() => handleToggleStatus(card)}
              >
                {togglingId === card.id ? 'Updating...' : card.status === 'active' ? 'Freeze Card' : 'Unfreeze Card'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

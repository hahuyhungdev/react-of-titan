import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '@acme-platform/ui';
import { executeTransfer, TransferResult } from '@acme-platform/transfers-data-access';
import { PlatformEventBus } from '@acme-platform/event-contracts';
import styles from './feature.module.css';

export const TransfersFeature: React.FC = () => {
  const [recipient, setRecipient] = useState<string>('ACC-992144 (Sarah Jenkins)');
  const [amount, setAmount] = useState<string>('250.00');
  const [note, setNote] = useState<string>('Dinner reimbursement');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<TransferResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    setSubmitting(true);
    setResult(null);

    const res = await executeTransfer({
      fromAccount: 'Primary Checking',
      toAccount: recipient,
      amount: numericAmount,
      note,
    });

    setSubmitting(false);
    setResult(res);

    if (res.success) {
      // Broadcast cross-MFE event via PlatformEventBus
      const eventBus = PlatformEventBus.getInstance();
      eventBus.emit('transfer:completed', {
        fromAccount: 'Primary Checking',
        toAccount: recipient,
        amount: numericAmount,
        reference: res.reference,
        timestamp: res.timestamp,
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Fast & Secure Money Transfers</h2>
        <Badge variant="warning">MFE Remote: Transfers</Badge>
      </div>

      <Card title="Execute P2P or Wire Transfer">
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <Input
              label="Recipient Account / ID"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. ACC-992144"
              required
            />
            <Input
              label="Amount ($ USD)"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <Input
            label="Memo / Reference Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What is this transfer for?"
          />

          {result && (
            <div className={result.success ? styles.resultAlertSuccess : styles.resultAlertError}>
              {result.message} {result.reference && `(Ref: ${result.reference})`}
            </div>
          )}

          <div className={styles.footerActions}>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Processing Transfer...' : 'Confirm & Transfer Funds'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

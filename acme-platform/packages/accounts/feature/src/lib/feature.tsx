import React, { useEffect, useState } from 'react';
import { Card, Badge } from '@acme-platform/ui';
import { fetchAccounts, fetchRecentTransactions, Account, Transaction } from '@acme-platform/accounts-data-access';
import { PlatformEventBus } from '@acme-platform/event-contracts';
import styles from './feature.module.css';

export const AccountsFeature: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastEventMsg, setLastEventMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchAccounts(), fetchRecentTransactions()]).then(([accs, txns]) => {
      setAccounts(accs);
      setTransactions(txns);
      setLoading(false);
    });

    const eventBus = PlatformEventBus.getInstance();
    // Subscribe to cross-MFE transfer events
    const unsubscribe = eventBus.subscribe('transfer:completed', (payload) => {
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) => {
          if (acc.name.toLowerCase().includes('checking')) {
            return { ...acc, balance: acc.balance - payload.amount };
          }
          return acc;
        })
      );

      // Add dynamic transaction item
      const newTxn: Transaction = {
        id: `txn-${Date.now()}`,
        accountId: 'acc-1',
        description: `Transfer to ${payload.toAccount} (Ref: ${payload.reference})`,
        amount: payload.amount,
        type: 'debit',
        timestamp: 'Just now',
        category: 'Transfer',
      };

      setTransactions((prevTxns) => [newTxn, ...prevTxns]);
      setLastEventMsg(`⚡ Event Received: Transferred $${payload.amount} to ${payload.toAccount}`);

      setTimeout(() => setLastEventMsg(null), 4000);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading accounts summary...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Accounts & Financial Overview</h2>
        <Badge variant="success">MFE Remote: Accounts</Badge>
      </div>

      {lastEventMsg && <div className={styles.eventBanner}>{lastEventMsg}</div>}

      <div className={styles.grid}>
        {accounts.map((acc) => (
          <Card key={acc.id} title={acc.name} className={styles.accountCard} badge={<Badge variant="success">{acc.type}</Badge>}>
            <div className={styles.accountNumber}>{acc.accountNumber}</div>
            <div className={styles.balance}>${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </Card>
        ))}
      </div>

      <Card title="Recent Activity">
        <div className={styles.txnList}>
          {transactions.map((txn) => (
            <div key={txn.id} className={styles.txnItem}>
              <div>
                <div className={styles.txnDesc}>{txn.description}</div>
                <div className={styles.txnMeta}>{txn.category} • {txn.timestamp}</div>
              </div>
              <div className={txn.type === 'credit' ? styles.txnAmountCredit : styles.txnAmountDebit}>
                {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export interface TransferRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
  note?: string;
}

export interface TransferResult {
  success: boolean;
  reference: string;
  timestamp: string;
  message: string;
}

export async function executeTransfer(req: TransferRequest): Promise<TransferResult> {
  // Simulate network latency & transfer validation logic
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (req.amount <= 0) {
    return {
      success: false,
      reference: '',
      timestamp: new Date().toISOString(),
      message: 'Transfer amount must be greater than $0',
    };
  }

  const ref = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    success: true,
    reference: ref,
    timestamp: new Date().toISOString(),
    message: `Transfer of $${req.amount.toFixed(2)} completed successfully`,
  };
}

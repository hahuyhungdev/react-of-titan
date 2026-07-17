// billing/model — types nội bộ của billing.
// Nếu sau này Order/Dashboard cũng cần Invoice → cân nhắc nâng lên entities/.
export type Invoice = {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "refunded";
  dueDate: string;
};

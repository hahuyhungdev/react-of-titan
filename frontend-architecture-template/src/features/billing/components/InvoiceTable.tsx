// InvoiceTable — DataTable generic (components/ui) + columns nghiệp vụ (Scenario 9).
import {
  DataTable,
  type Column,
} from "@/shared/components/ui/data-table/DataTable";
import { formatDate } from "@/shared/lib/date";
import { formatCurrency } from "@/shared/lib/currency";
import type { Invoice } from "../model/billing.types";
import { useInvoices } from "../hooks/useInvoices";
import { RefundButton } from "./RefundButton";

const columns: Column<Invoice>[] = [
  { key: "number", header: "Số hóa đơn", render: (inv) => inv.number },
  {
    key: "amount",
    header: "Số tiền",
    render: (inv) => formatCurrency(inv.amount, inv.currency),
  },
  {
    key: "due",
    header: "Hạn thanh toán",
    render: (inv) => formatDate(new Date(inv.dueDate)),
  },
  { key: "status", header: "Trạng thái", render: (inv) => inv.status },
  {
    key: "actions",
    header: "",
    render: (inv) =>
      inv.status === "paid" ? <RefundButton invoiceId={inv.id} /> : null,
  },
];

export function InvoiceTable() {
  const { data: invoices = [], isPending } = useInvoices();

  if (isPending) return <p>Đang tải…</p>;

  return (
    <DataTable columns={columns} data={invoices} getRowKey={(inv) => inv.id} />
  );
}

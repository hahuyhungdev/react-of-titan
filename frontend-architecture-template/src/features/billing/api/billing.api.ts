// billing/api — queryOptions colocate với feature (TkDodo pattern).
// Query key prefix 'billing' → invalidate cả feature dễ dàng.
import { queryOptions } from "@tanstack/react-query";
import { httpClient } from "@/infrastructure/http/client";
import type { Invoice } from "../model/billing.types";

export const invoicesQueryOptions = queryOptions({
  queryKey: ["billing", "invoices"],
  queryFn: ({ signal }) =>
    httpClient.get<Invoice[]>("/billing/invoices", { signal }),
  staleTime: 60_000,
});

export function refundPayment(invoiceId: string): Promise<Invoice> {
  return httpClient.post<Invoice>(`/billing/invoices/${invoiceId}/refund`, {});
}

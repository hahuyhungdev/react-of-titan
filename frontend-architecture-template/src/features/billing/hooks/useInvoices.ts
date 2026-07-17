import { useQuery } from "@tanstack/react-query";
import { invoicesQueryOptions } from "../api/billing.api";

export function useInvoices() {
  return useQuery(invoicesQueryOptions);
}

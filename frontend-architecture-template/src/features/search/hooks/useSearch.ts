// search — CAPABILITY vertical (Scenario 7).
// Generic: KHÔNG biết search cái gì. Feature dùng nó INJECT fetcher của mình vào.
import { useQuery } from "@tanstack/react-query";
import { useState, useDeferredValue } from "react";

type UseSearchOptions<T> = {
  /** Feature truyền hàm search của nó vào — đây là chỗ nghiệp vụ được inject */
  fetcher: (query: string) => Promise<T[]>;
  scope: string;
  minLength?: number;
};

export function useSearch<T>({
  fetcher,
  scope,
  minLength = 2,
}: UseSearchOptions<T>) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const enabled = deferredQuery.length >= minLength;

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", scope, deferredQuery],
    queryFn: () => fetcher(deferredQuery),
    enabled,
    staleTime: 30_000,
  });

  return { query, setQuery, results, isFetching };
}

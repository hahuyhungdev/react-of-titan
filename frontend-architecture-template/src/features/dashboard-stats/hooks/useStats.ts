import { useQuery } from '@tanstack/react-query';
import { statsQueryOptions } from '../api/stats.api';

export function useStats() {
  const { data: stats, isPending, error } = useQuery(statsQueryOptions);

  return {
    stats,
    isLoading: isPending,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  };
}

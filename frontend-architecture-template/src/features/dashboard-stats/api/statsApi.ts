import { httpClient } from '@/infrastructure/http/client';
import type { DashboardStats } from '../types/stats.types';
import { queryOptions } from '@tanstack/react-query';

export const statsQueryOptions = queryOptions({
  queryKey: ['dashboard', 'stats'],
  queryFn: ({ signal }) => httpClient.get<DashboardStats>('/dashboard/stats', { signal }),
  staleTime: 5 * 60 * 1000,
});

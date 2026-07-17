import { httpClient } from '@/infrastructure/http/client';
import type { Activity } from '../types/activity.types';
import { queryOptions } from '@tanstack/react-query';

export const activityQueryOptions = queryOptions({
  queryKey: ['dashboard', 'activities'],
  queryFn: ({ signal }) => httpClient.get<Activity[]>('/dashboard/activity', { signal }),
  staleTime: 60_000,
});

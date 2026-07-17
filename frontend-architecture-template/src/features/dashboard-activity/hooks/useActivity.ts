import { useQuery } from '@tanstack/react-query';
import { activityQueryOptions } from '../api/activityApi';

export function useActivity() {
  const { data: activities = [], isPending, error } = useQuery(activityQueryOptions);

  return {
    activities,
    isLoading: isPending,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  };
}

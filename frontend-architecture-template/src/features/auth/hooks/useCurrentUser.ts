import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '../api/auth.api';

export function useCurrentUser() {
  return useQuery(meQueryOptions);
}

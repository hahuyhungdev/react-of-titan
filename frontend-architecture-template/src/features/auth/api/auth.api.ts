// auth/api — mọi HTTP call của auth ở một chỗ, đi qua infrastructure adapter.
// Segment api/ là PRIVATE — ngoài feature không được import (ESLint enforce).
import { httpClient } from "@/infrastructure/http/client";
import type { User } from "@/entities/user/user";
import type { LoginInput, RegisterInput } from "../model/login.schema";

import { queryOptions } from '@tanstack/react-query';

export const meQueryOptions = queryOptions({
  queryKey: ['auth', 'me'],
  queryFn: ({ signal }) => httpClient.get<{ user: User }>('/auth/me', { signal }).then((res) => res.user),
  staleTime: 5 * 60 * 1000,
});

export function login(input: LoginInput): Promise<{ user: User }> {
  return httpClient.post<{ user: User }>("/auth/login", input);
}

export function logout(): Promise<void> {
  return httpClient.post<void>("/auth/logout", {});
}

export function registerUser(input: RegisterInput): Promise<{ user: User }> {
  return httpClient.post<{ user: User }>("/auth/register", input);
}

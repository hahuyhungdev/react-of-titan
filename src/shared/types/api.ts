/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

/**
 * Paginated response.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Common error shape from API.
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

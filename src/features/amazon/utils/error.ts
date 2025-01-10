export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Don't retry client errors
    if (error.status && error.status >= 400 && error.status < 500) {
      return false;
    }
  }
  return true;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
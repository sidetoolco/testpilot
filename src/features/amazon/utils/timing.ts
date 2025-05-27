export const PRODUCT_FETCH_BUFFER = 120000; // 2 minutes in milliseconds

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function isStale(timestamp: number): boolean {
  return Date.now() - timestamp > PRODUCT_FETCH_BUFFER;
}

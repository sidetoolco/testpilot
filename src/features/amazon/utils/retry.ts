const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 5000; // 5 seconds

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's a validation error
      if (error.message.includes('required') || error.message.includes('invalid')) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        INITIAL_DELAY * Math.pow(2, attempt),
        MAX_DELAY
      );

      // Add some jitter
      const jitter = Math.random() * 200;
      
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError || new Error('All retry attempts failed');
}
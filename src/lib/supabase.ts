import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Temporarily remove flowType to use default flow
    // flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'testpilot',
    },
  },
  db: {
    schema: 'public',
  },
  // Add retryable fetch with exponential backoff
  fetch: (url, options = {}) => {
    const retries = 3;
    const baseDelay = 1000; // 1 second

    const fetchWithRetry = async (attempt = 0): Promise<Response> => {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok && attempt < retries) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      } catch (error) {
        if (attempt >= retries) throw error;

        // Exponential backoff with jitter
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 5000) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        return fetchWithRetry(attempt + 1);
      }
    };

    return fetchWithRetry();
  },
});

// Add error handler
supabase.handleError = (error: any) => {
  console.error('Supabase error:', error);

  // Check if it's a network error
  if (error.message === 'Failed to fetch') {
    return new Error('Network error - please check your connection');
  }

  // Check if it's an auth error
  if (error.status === 401) {
    supabase.auth.signOut();
    return new Error('Your session has expired - please sign in again');
  }

  return error;
};

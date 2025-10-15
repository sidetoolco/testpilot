import axios, { HttpStatusCode } from 'axios';
import { supabase } from './supabase';

// For local development, use proxy to avoid CORS issues
// For production, use the environment variable or fallback to production URL
const baseURL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://tespilot-api-301794542770.us-central1.run.app');

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async config => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session: ', error);
      return Promise.reject(error);
    }

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === HttpStatusCode.Unauthorized) {
      // Clear Supabase session
      await supabase.auth.signOut();
    }

    return Promise.reject(error);
  }
);

// Add function to update test block status
export const updateTestBlock = async (testId: string, block: boolean) => {
  return apiClient.post('/tests/block', {
    testId,
    block,
  });
};

export default apiClient;

import axios, { HttpStatusCode } from 'axios';
import { supabase } from './supabase';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use(
  async config => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('Error getting session: ', error);
      return Promise.reject(error);
    }

    if (session.access_token) {
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

export default apiClient;

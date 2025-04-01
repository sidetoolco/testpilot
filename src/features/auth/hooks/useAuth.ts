import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { AuthFormData } from '../types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, session, loading, error, setUser, setSession, setLoading, setError } = useAuthStore();

  const handleAuthAction = useCallback(async (
    action: () => Promise<any>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await action();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const signUp = useCallback(async (data: AuthFormData) => {
    try {
      const result = await handleAuthAction(async () => {
        const authResult = await authService.signUp(data);
        setUser(authResult.user);
        setSession(authResult.session);
        return authResult;
      });
      navigate('/');
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }, [handleAuthAction, navigate, setUser, setSession]);

  const signIn = useCallback(async (data: AuthFormData) => {
    try {
      const result = await handleAuthAction(async () => {
        const authResult = await authService.signIn(data);
        setUser(authResult.user);
        setSession(authResult.session);
        return authResult;
      });
      navigate('/');
      return result;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }, [handleAuthAction, navigate, setUser, setSession]);

  const signOut = useCallback(async () => {
    await handleAuthAction(async () => {
      await authService.signOut();
      setUser(null);
      setSession(null);
      navigate('/login');
    });
  }, [handleAuthAction, setUser, setSession, navigate]);

  const resetPassword = useCallback(async (email: string) => {
    await handleAuthAction(async () => {
      await authService.resetPassword(email);
    });
  }, [handleAuthAction]);

  const updatePassword = useCallback(async (password: string, token: string) => {
    await handleAuthAction(async () => {
      await authService.updatePassword(password, token);
    });
  }, [handleAuthAction]);

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
};
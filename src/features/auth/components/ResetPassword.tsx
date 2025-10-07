import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';
import AuthError from './AuthError';
import AuthButton from './AuthButton';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { supabase } from '../../../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading: authLoading } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'authenticating' | 'updating' | 'success' | 'error'
  >('idle');
  const [email, setEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handlePasswordReset = async () => {
      setStatus('authenticating');

      try {
        // Check for URL parameters (new flow with code)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Check for errors in the URL
        if (error) {
          throw new Error(errorDescription || error);
        }

        if (code) {
          // New flow: exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            throw exchangeError;
          }

          if (!data.user?.email) {
            throw new Error('User email not found');
          }

          setEmail(data.user.email);
          setStatus('idle');
          return;
        }

        // Fallback: Check hash fragment for tokens (old flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const hashError = hashParams.get('error');
        const hashErrorDescription = hashParams.get('error_description');

        if (hashError) {
          throw new Error(hashErrorDescription || hashError);
        }

        if (!accessToken || !refreshToken) {
          throw new Error('Reset link is invalid or has expired. Please request a new one.');
        }

        // Set the session with the tokens from the URL
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          throw sessionError;
        }

        if (!data.user?.email) {
          throw new Error('User email not found');
        }

        setEmail(data.user.email);
        setStatus('idle');
      } catch (err: any) {
        console.error('Error handling password reset:', err);
        setStatus('error');
        setFormError(err.message || 'Error verifying the reset link. Please request a new one.');
      }
    };

    handlePasswordReset();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      setStatus('updating');
      await authService.updatePassword(password);
      setStatus('success');
      toast.success('Password updated successfully');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Error updating password');
      setStatus('error');
      toast.error('Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'authenticating' || authLoading) {
    return (
      <AuthLayout title="Verifying link" subtitle="Please wait while we verify your link">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A67E]"></div>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'error') {
    return (
      <AuthLayout title="Reset Password Failed" subtitle="The link is invalid or has expired">
        <div className="text-center">
          <p className="text-red-500 mb-4">{formError}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-[#00A67E] hover:text-[#008F6B] font-medium"
          >
            Request a new link
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <AuthLayout title="Password Updated" subtitle="Your password has been successfully updated">
        <div className="text-center">
          <p className="text-green-500 mb-4">Redirecting to login...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password">
      {email && <p className="text-center text-gray-600 mb-4">Email: {email}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthError error={formError} />

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              disabled={isSubmitting}
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={8}
              disabled={isSubmitting}
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AuthButton loading={isSubmitting} label="Update Password" loadingLabel="Updating..." />
      </form>
    </AuthLayout>
  );
}

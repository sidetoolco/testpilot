import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';
import AuthError from './AuthError';
import AuthButton from './AuthButton';
import { toast } from 'sonner';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'updating' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const code = searchParams.get('code');
      if (!code) {
        setStatus('error');
        return;
      }

      setStatus('authenticating');

      try {
        const { data } = await authService.exchangeCodeForSession(code);
        if (data?.user?.email) {
          setEmail(data.user.email);
          setStatus('idle');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error('Session restoration error:', err);
        setStatus('error');
      }
    };

    restoreSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    try {
      setStatus('updating');
      await authService.updatePassword(password);
      setStatus('success');
      toast.success('Password updated successfully');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setFormError(err.message);
      setStatus('error');
      toast.error('Failed to update password');
    }
  };

  if (status === 'authenticating') {
    return (
      <AuthLayout
        title="Verifying reset link"
        subtitle="Please wait while we verify your reset link"
      >
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A67E]"></div>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'error') {
    return (
      <AuthLayout
        title="Reset Password Failed"
        subtitle="The reset link is invalid or has expired"
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">{formError}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-[#00A67E] hover:text-[#008F6B] font-medium"
          >
            Request a new reset link
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <AuthLayout
        title="Password Updated"
        subtitle="Your password has been successfully updated"
      >
        <div className="text-center">
          <p className="text-green-500 mb-4">Redirecting to login...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      {email && (
        <p className="text-center text-gray-600 mb-4">
          Email: {email}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthError error={formError || error} />

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        <AuthButton
          loading={status === 'updating'}
          label="Reset Password"
          loadingLabel="Updating..."
        />
      </form>
    </AuthLayout>
  );
}
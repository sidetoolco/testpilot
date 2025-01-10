import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';
import AuthError from './AuthError';
import AuthButton from './AuthButton';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const { resetPassword, loading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      await resetPassword(email);
      setSuccess(true);
      toast.success('Password reset instructions sent to your email');
    } catch (err: any) {
      setFormError(err.message);
      toast.error('Failed to send reset instructions');
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you instructions to reset your password."
    >
      {success ? (
        <div className="text-center">
          <div className="mb-4 text-sm text-green-600 bg-green-50 p-4 rounded-xl">
            Check your email for password reset instructions.
          </div>
          <Link
            to="/login"
            className="text-[#00A67E] hover:text-[#008F6B] font-medium"
          >
            Return to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthError error={formError || error} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <AuthButton
            loading={loading}
            label="Send reset instructions"
            loadingLabel="Sending..."
          />

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-[#00A67E] hover:text-[#008F6B] font-medium"
            >
              Back to login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
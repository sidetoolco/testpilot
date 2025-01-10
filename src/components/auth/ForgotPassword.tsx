import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPassword() {
  const { resetPassword, loading, error } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const validatedData = emailSchema.parse({ email });
      await resetPassword(validatedData.email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setFormError(err.errors[0].message);
      } else {
        setFormError(error || 'An error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F8]">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://api.products.aspose.app/words/conversion/api/Download?id=2345e3f9-9e45-4236-a911-de78c868b400%2FTestPilot%20Mocks%20Final.png"
              alt="TestPilot"
              className="h-12"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Reset your password</h2>
          <p className="text-gray-600 mt-2">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          {success ? (
            <div className="text-center">
              <div className="mb-4 text-green-600">
                Check your email for password reset instructions.
              </div>
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-500 font-medium"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-400 text-white py-3 rounded-xl font-medium hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-primary-400 hover:text-primary-500 font-medium"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
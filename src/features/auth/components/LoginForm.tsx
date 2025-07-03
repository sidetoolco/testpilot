import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../validation/schemas';
import AuthError from './AuthError';
import AuthButton from './AuthButton';
import MarketingPanel from './marketing/MarketingPanel';

export default function LoginForm() {
  const navigate = useNavigate();
  const { signIn, loading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const validatedData = loginSchema.parse({ email, password });
      await signIn(validatedData);
      navigate('/');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <img
                src="/assets/images/testPilot-black.png"
                alt="TestPilot"
                className="h-12 mx-auto"
              />
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AuthError error={formError || error} />

            <div className="space-y-4">
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#00A67E] hover:text-[#008F6B] transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <AuthButton loading={loading} label="Sign in" loadingLabel="Signing in..." />

            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative">
                <span className="px-2 text-sm text-gray-500 bg-white">Don't have an account?</span>
              </div>
            </div>

            <Link
              to="/signup"
              className="block w-full text-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Create an account
            </Link>
          </form>
        </div>
      </div>

      {/* Right Panel - Marketing */}
      <MarketingPanel />
    </div>
  );
}

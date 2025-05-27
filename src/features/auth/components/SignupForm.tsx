import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signupSchema } from '../validation/schemas';
import AuthLayout from './AuthLayout';
import AuthError from './AuthError';
import AuthButton from './AuthButton';
import SignupFeatureCard from './SignupFeatureCard';

export default function SignupForm() {
  const navigate = useNavigate();
  const { signUp, loading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const companyName = formData.get('companyName') as string;

    try {
      const validatedData = signupSchema.parse({ email, password, fullName, companyName });
      await signUp(validatedData);
      navigate('/');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start testing your products today"
      rightPanel={<SignupFeatureCard />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img
              src="/assets/images/testPilot-black.png"
              alt="TestPilot"
              className="h-12 mx-auto"
            />
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900">Create an account</h2>
          <p className="text-gray-600 mt-2">Start testing your products today</p>
        </div>

        <AuthError error={formError || error} />

        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Company name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200"
                placeholder="Acme Inc."
              />
            </div>
          </div>

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
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>
        </div>

        <AuthButton loading={loading} label="Create account" loadingLabel="Creating account..." />

        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative">
            <span className="px-2 text-sm text-gray-500 bg-white">Already have an account?</span>
          </div>
        </div>

        <Link
          to="/login"
          className="block w-full text-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Sign in instead
        </Link>
      </form>
    </AuthLayout>
  );
}

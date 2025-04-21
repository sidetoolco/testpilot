import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export default function SignupForm() {
  const navigate = useNavigate();
  const { signUp, loading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    try {
      const validatedData = signupSchema.parse({ email, password, fullName });
      await signUp(validatedData.email, validatedData.password, validatedData.fullName);
      navigate('/');
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during signup');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link 
              to="/"
              className="inline-block mb-6"
            >
              <img 
                src="/assets/images/testPilot-black.png"
                alt="TestPilot"
                className="h-12 mx-auto"
              />
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900">Create an account</h2>
            <p className="text-gray-600 mt-2">Start testing your products today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-red-500 bg-red-50 rounded-xl"
              >
                {error}
              </motion.div>
            )}

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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                    placeholder="John Doe"
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full inline-flex items-center justify-center px-4 py-3 bg-primary-400 text-white rounded-xl font-medium hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
            >
              <span>{loading ? 'Creating account...' : 'Create account'}</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative">
                <span className="px-2 text-sm text-gray-500 bg-white">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link
              to="/login"
              className="block w-full text-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
            >
              Sign in instead
            </Link>
          </form>
        </motion.div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:block lg:w-1/2 bg-[#FFF8F8]">
        <div className="h-full flex items-center justify-center p-12">
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-4 mb-8">
                <img 
                  src="/assets/images/testPilot-black.png"
                  alt="TestPilot"
                  className="h-12"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Why choose TestPilot?</h3>
                  <p className="text-sm text-gray-500">The smart way to test your products</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Real Customer Feedback</h4>
                    <p className="text-sm text-gray-500">Get insights from your target audience</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">A/B Testing</h4>
                    <p className="text-sm text-gray-500">Test different product variations</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Detailed Analytics</h4>
                    <p className="text-sm text-gray-500">Make data-driven decisions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Easy Integration</h4>
                    <p className="text-sm text-gray-500">Works with your existing e-commerce platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { signupSchema } from '../features/auth/validation/schemas';
import AuthLayout from '../features/auth/components/AuthLayout';
import AuthError from '../features/auth/components/AuthError';
import AuthButton from '../features/auth/components/AuthButton';
import { supabase } from '../lib/supabase';
import { Invite } from '../lib/db';

export default function TeamInviteForm() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { signUp, loading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<{
    email: string;
    companyId: string;
    companyName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateInvite = async () => {
      try {
        // Fetch invite data
        const { data, error: inviteError } = await supabase
          .from('invites')
          .select('email, company_id, company:companies(name), expires_at')
          .eq('token', token as any)
          .maybeSingle();

        if (inviteError || !data) {
          setFormError('Invalid or expired invitation link');
          return;
        }

        const invite: Invite = data as any;

        // Check if invite has expired
        if (new Date(invite.expires_at) < new Date()) {
          setFormError('This invitation has expired');
          return;
        }

        setInviteData({
          email: invite.email,
          companyId: invite.company_id,
          companyName: invite.company?.name || '',
        });
      } catch (err) {
        setFormError('Error validating invitation');
      } finally {
        setIsLoading(false);
      }
    };

    validateInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const password = formData.get('password') as string;

    try {
      const validatedData = signupSchema.parse({
        email: inviteData?.email,
        password,
        fullName,
        companyName: inviteData?.companyName,
      });

      // Add company_id to user metadata
      await signUp({
        ...validatedData,
        companyId: inviteData?.companyId,
      });

      navigate('/');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Validating invitation" subtitle="Please wait...">
        <div className="text-center">Loading...</div>
      </AuthLayout>
    );
  }

  if (formError) {
    return (
      <AuthLayout title="Invalid Invitation" subtitle="There was a problem with your invitation">
        <div className="text-center">
          <p className="text-red-600 mb-4">{formError}</p>
          <Link to="/login" className="text-[#00A67E] hover:underline">
            Return to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Join your team"
      subtitle={`You've been invited to join ${inviteData?.companyName}`}
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
          <h2 className="text-2xl font-semibold text-gray-900">Complete your account</h2>
          <p className="text-gray-600 mt-2">
            Join <b>{inviteData?.companyName}</b>
          </p>
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                disabled
                value={inviteData?.email}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
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

        <AuthButton loading={loading} label="Join team" loadingLabel="Creating account..." />

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

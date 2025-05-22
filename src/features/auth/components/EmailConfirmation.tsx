import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { CheckCircle, XCircle } from 'lucide-react';

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const token = searchParams.get('token');

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    }

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F8]">
      <div className="max-w-md w-full px-6">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          {status === 'verifying' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-[#00A67E] mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600">
                Your email has been successfully verified. Redirecting you to login...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-4">
                We couldn't verify your email. The link may have expired or is invalid.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="text-primary-400 hover:text-primary-500 font-medium"
              >
                Return to login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

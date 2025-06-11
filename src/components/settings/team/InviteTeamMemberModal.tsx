import { useState } from 'react';
import ModalLayout from '../../../layouts/ModalLayout';
import { Mail, AlertCircle } from 'lucide-react';
import apiClient from '../../../lib/api';
import { DEFAULT_ERROR_MSG } from '../../../lib/constants';

interface InviteModalProps {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (inviteeEmail: string) => void;
}

export const InviteModal = ({ isOpen, onClose, companyId, onSuccess }: InviteModalProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post(`/companies/${companyId}/invite`, { email });

      onSuccess(email);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || DEFAULT_ERROR_MSG);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Invite Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError(null); // Clear error when user types
              }}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                error ? 'border-red-300' : 'border-gray-200'
              } focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200`}
              placeholder="name@company.com"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#00A67E] text-white py-3 rounded-xl hover:bg-[#008F6B] transition-colors disabled:opacity-70"
          disabled={loading}
        >
          {loading ? 'Sending invitation...' : 'Send Invitation'}
        </button>
      </form>
    </ModalLayout>
  );
};

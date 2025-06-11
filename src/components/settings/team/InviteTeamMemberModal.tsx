import { useState } from 'react';
import ModalLayout from '../../../layouts/ModalLayout';
import { Mail } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal = ({ isOpen, onClose }: InviteModalProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement invite functionality
    console.log('Inviting:', email);
    onClose();
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Invite Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors duration-200"
              placeholder="name@company.com"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#00A67E] text-white py-3 rounded-xl hover:bg-[#008F6B] transition-colors"
        >
          Send Invitation
        </button>
      </form>
    </ModalLayout>
  );
};

import { AlertTriangle, Loader2 } from 'lucide-react';
import { User } from '../../types/user';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  isLoading: boolean;
}

export const DeleteUserModal = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading,
}: DeleteUserModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{user.full_name || user.email}</strong>? This will:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Remove the user from their company</li>
            <li>• Delete all user data</li>
            <li>• Remove access to all tests and results</li>
          </ul>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                'Delete User'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
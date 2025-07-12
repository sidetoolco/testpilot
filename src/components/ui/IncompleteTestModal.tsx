import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface IncompleteTestModalProps {
  isOpen: boolean;
  onSave: (testName?: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  currentTestName?: string;
}

export default function IncompleteTestModal({
  isOpen,
  onSave,
  onCancel,
  isSaving,
  currentTestName,
}: IncompleteTestModalProps) {
  const [testName, setTestName] = useState('');
  const needsName = !currentTestName?.trim();

  useEffect(() => {
    if (isOpen) {
      setTestName(currentTestName || '');
    }
  }, [isOpen, currentTestName]);

  const handleSave = async () => {
    if (needsName && !testName.trim()) {
      return; // No guardar si necesita nombre y está vacío
    }

    await onSave(needsName ? testName.trim() : undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Incomplete Test in Progress</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          You have an incomplete test in progress. Do you want to save it before leaving?
        </p>

        {needsName && (
          <div className="mb-4">
            <label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-2">
              Test Name
            </label>
            <input
              id="testName"
              type="text"
              value={testName}
              onChange={e => setTestName(e.target.value)}
              placeholder="Enter a name for your test"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isSaving}
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (needsName && !testName.trim())}
            className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

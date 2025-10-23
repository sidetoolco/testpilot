import React from 'react';
import { X } from 'lucide-react';

interface SurveyExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyExampleModal: React.FC<SurveyExampleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            Example: How Testers See and Answer Questions
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          <img 
            src="/assets/images/survey-example.png" 
            alt="Example of how testers see and answer survey questions"
            className="rounded-lg border border-gray-200"
            style={{ width: '78%', height: 'auto' }}
          />
          <p className="mt-4 text-sm text-gray-600 text-center">
            This is how participants see and respond to survey questions when comparing products.
          </p>
        </div>
      </div>
    </div>
  );
};


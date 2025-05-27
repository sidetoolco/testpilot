import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

export default function ComingSoonModal({
  isOpen,
  onClose,
  title,
  description,
}: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-50 rounded-full p-3">
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {description && <p className="text-gray-600 text-lg leading-relaxed mb-6">{description}</p>}

        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-blue-600 text-sm">
            We're working hard to bring this feature to you soon. Stay tuned for updates!
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface AuthErrorProps {
  error: string | null;
}

const parseErrorMessages = (error: string | null): string[] => {
  if (!error) return [];

  try {
    const parsed = JSON.parse(error);
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => {
          if (typeof item === 'string') {
            return item;
          } else if (item && typeof item === 'object' && 'message' in item) {
            return String(item.message);
          } else if (item && typeof item === 'object') {
            return JSON.stringify(item);
          } else if (item != null) {
            return String(item);
          }
          return null;
        })
        .filter((msg): msg is string => msg !== null && msg.trim() !== '');
    } else {
      return [error];
    }
  } catch (e) {
    return [error];
  }
};

export default function AuthError({ error }: AuthErrorProps) {
  const messages = parseErrorMessages(error);

  return (
    <AnimatePresence>
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-start space-x-3 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface AuthErrorProps {
  error: string | null;
}

export default function AuthError({ error }: AuthErrorProps) {
  if (!error) {
    return null;
  }

  let messages: string[];

  try {
    const parsed = JSON.parse(error);
    messages = Array.isArray(parsed) ? parsed.map(err => err.message) : [error];
  } catch (e) {
    messages = [error];
  }
  const validMessages = messages.filter(Boolean);

  if (validMessages.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
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
          {validMessages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
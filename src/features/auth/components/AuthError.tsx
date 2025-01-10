import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface AuthErrorProps {
  error: string | null;
}

export default function AuthError({ error }: AuthErrorProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center space-x-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AuthButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
  className?: string;
}

export default function AuthButton({ loading, label, loadingLabel, className }: AuthButtonProps) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className={cn(
        "relative w-full bg-[#00A67E] text-white py-3.5 rounded-xl font-medium",
        "hover:bg-[#008F6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A67E]",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200",
        "flex items-center justify-center space-x-2",
        className
      )}
    >
      {loading && (
        <Loader2 className="h-5 w-5 animate-spin" />
      )}
      <span>{loading ? loadingLabel : label}</span>
    </motion.button>
  );
}
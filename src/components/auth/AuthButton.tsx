import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AuthButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
  icon?: React.ReactNode;
  className?: string;
  type?: 'submit' | 'button';
  onClick?: () => void;
}

export default function AuthButton({
  loading,
  label,
  loadingLabel,
  icon,
  className,
  type = 'submit',
  onClick
}: AuthButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className={cn(
        "relative w-full inline-flex items-center justify-center px-4 py-3",
        "bg-primary-400 text-white rounded-xl font-medium",
        "hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
        "shadow-sm hover:shadow-md",
        className
      )}
    >
      {loading && (
        <Loader2 className="absolute left-4 h-5 w-5 animate-spin" />
      )}
      <span>{loading ? loadingLabel : label}</span>
      {icon && !loading && (
        <span className="ml-2 transition-transform group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </motion.button>
  );
}
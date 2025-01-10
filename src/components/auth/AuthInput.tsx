import React from 'react';
import { cn } from '../../lib/utils';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
}

export default function AuthInput({
  label,
  icon,
  error,
  hint,
  className,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-gray-200",
            "focus:ring-2 focus:ring-primary-400 focus:border-primary-400",
            "transition-all duration-200",
            icon && "pl-10",
            error && "border-red-300 focus:ring-red-400 focus:border-red-400",
            className
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}
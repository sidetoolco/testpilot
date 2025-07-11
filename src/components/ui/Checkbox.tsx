import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function Checkbox({ id, label, checked, onChange, className = '' }: CheckboxProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={`w-5 h-5 border-2 rounded transition-all cursor-pointer flex items-center justify-center ${
            checked
              ? 'border-[#00A67E] bg-[#00A67E]'
              : 'border-gray-300 hover:border-[#00A67E]'
          }`}
        >
          {checked && (
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
      </div>
      <span className="text-gray-700 select-none">
        {label}
      </span>
    </div>
  );
} 
import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export default function Checkbox({ id, label, checked, onChange, className = '', disabled = false }: CheckboxProps) {
  return (
    <div className={`flex items-center space-x-3 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={`w-5 h-5 border-2 rounded transition-all flex items-center justify-center ${
            disabled 
              ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
              : checked 
                ? 'border-[#00A67E] bg-[#00A67E] cursor-pointer' 
                : 'border-gray-300 hover:border-[#00A67E] cursor-pointer'
          }`}
        >
          {checked && (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
      </div>
      <span className={`text-gray-700 select-none ${disabled ? 'cursor-not-allowed' : ''}`}>{label}</span>
    </div>
  );
}

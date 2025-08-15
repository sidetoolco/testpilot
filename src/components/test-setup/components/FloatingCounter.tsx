import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface FloatingCounterProps {
  selectedCount: number;
  maxCount: number;
  isPopping: boolean;
  isAllSelected: boolean;
  variant?: 'simple' | 'detailed';
}

export function FloatingCounter({
  selectedCount,
  maxCount,
  isPopping,
  isAllSelected,
  variant = 'detailed',
}: FloatingCounterProps) {
  const baseClasses = `fixed bottom-8 right-8 rounded-lg shadow-lg p-4 z-50 border transition-all duration-300 ease-out`;
  
  const variantClasses = isPopping
    ? 'bg-white text-gray-700 border-[#00A67E] scale-110'
    : isAllSelected
      ? 'bg-[#00A67E] text-white border-[#00A67E] scale-110 animate-pulse'
      : 'bg-white text-gray-700 border-gray-200 scale-100';

  if (variant === 'simple') {
    return (
      <div className={`${baseClasses} ${variantClasses}`}>
        <div className="text-center">
          <div className="text-2xl font-bold">{selectedCount}</div>
          <div className="text-sm">of {maxCount}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="flex items-center space-x-2">
        <CheckCircle2 className={`h-5 w-5 ${isAllSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="text-sm font-medium">
          {selectedCount} of {maxCount} selected
        </span>
      </div>
    </div>
  );
}

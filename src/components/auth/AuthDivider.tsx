import React from 'react';

interface AuthDividerProps {
  children: React.ReactNode;
}

export default function AuthDivider({ children }: AuthDividerProps) {
  return (
    <div className="relative text-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative">
        <span className="px-2 text-sm text-gray-500 bg-white">
          {children}
        </span>
      </div>
    </div>
  );
}
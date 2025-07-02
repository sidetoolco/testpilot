import React from 'react';

interface SearchHeaderProps {
  title: string;
  subtitle?: string;
}

export function SearchHeader({ title, subtitle }: SearchHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}

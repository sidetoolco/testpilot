import React from 'react';
import { Search } from 'lucide-react';

interface TestSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TestSearch({ value, onChange }: TestSearchProps) {
  return (
    <div className="relative mb-8">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        placeholder="Search tests by name or search term..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-[#00A67E] focus:ring-2 focus:ring-[#00A67E]/20 transition-all outline-none text-gray-800 placeholder-gray-400 bg-white shadow-sm"
      />
    </div>
  );
}

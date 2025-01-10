import React from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { TestSession } from '../../../types';

interface InsightHeaderProps {
  session: TestSession;
  onBack: () => void;
}

export default function InsightHeader({ session, onBack }: InsightHeaderProps) {
  return (
    <div className="flex items-center space-x-4 mb-8">
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>
      <div>
        <div className="flex items-center space-x-3 mb-1">
          <h1 className="text-[2.5rem] text-[#1B1B1B] font-normal">{session.test}</h1>
          <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium">
            Test Insights
          </span>
        </div>
        <div className="flex items-center space-x-3 text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{session.date}</span>
          </div>
          <span>•</span>
          <span>{session.duration} duration</span>
        </div>
      </div>
    </div>
  );
}
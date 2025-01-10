import React from 'react';
import { Users } from 'lucide-react';

interface TestProgressProps {
  totalTesters: number;
  completedTesters: number;
}

export default function TestProgress({ totalTesters, completedTesters }: TestProgressProps) {
  const progress = (completedTesters / totalTesters) * 100;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Test Progress</h3>
            <p className="text-sm text-gray-500">
              {completedTesters} of {totalTesters} testers completed
            </p>
          </div>
        </div>
        <span className="text-2xl font-semibold text-blue-600">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
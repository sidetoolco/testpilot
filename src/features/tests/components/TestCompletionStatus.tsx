import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { getTestDataCompletionStatus } from '../utils/testValidation';
import { TestData } from '../types';

interface TestCompletionStatusProps {
  testData: TestData;
  showMissingFields?: boolean;
}

export default function TestCompletionStatus({ testData, showMissingFields = true }: TestCompletionStatusProps) {
  const completion = getTestDataCompletionStatus(testData);
  
  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle size={16} className="text-green-600" />;
    if (percentage >= 60) return <AlertCircle size={16} className="text-yellow-600" />;
    return <Circle size={16} className="text-gray-400" />;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Test Completion Status</h3>
        <div className="flex items-center gap-2">
          {getStatusIcon(completion.completionPercentage)}
          <span className={`text-sm font-medium ${getStatusColor(completion.completionPercentage)}`}>
            {completion.completionPercentage}% Complete
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              completion.completionPercentage >= 80 ? 'bg-green-600' :
              completion.completionPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${completion.completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {completion.completedFields} of {completion.totalFields} required fields completed
        </p>
      </div>

      {showMissingFields && completion.missingFields.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Missing Fields:</h4>
          <ul className="space-y-1">
            {completion.missingFields.map((field, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <Circle size={12} className="text-gray-400" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

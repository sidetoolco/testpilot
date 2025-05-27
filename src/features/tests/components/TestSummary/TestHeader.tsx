import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TestHeaderProps {
  testName: string;
  status: string;
  date: string;
}

export default function TestHeader({ testName, status, date }: TestHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-[1400px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/my-tests')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to tests</span>
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold">{testName}</h1>
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                <Clock className="h-4 w-4" />
                <span>{status}</span>
              </div>
            </div>
          </div>
          <span className="text-gray-500">{date}</span>
        </div>
      </div>
    </div>
  );
}

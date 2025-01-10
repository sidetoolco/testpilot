import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTests } from '../features/tests/hooks/useTests';
import TestSummary from '../features/tests/components/TestSummary';

export default function TestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tests, loading } = useTests();
  const test = tests.find(t => t.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Test not found</h2>
          <button
            onClick={() => navigate('/my-tests')}
            className="text-primary-400 hover:text-primary-500 hover:underline"
          >
            Return to tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F8]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <button 
            onClick={() => navigate('/my-tests')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to tests</span>
          </button>
        </div>
      </div>

      <TestSummary test={test} />
    </div>
  );
}
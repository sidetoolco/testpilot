import React from 'react';
import { Play, Loader2 } from 'lucide-react';
import { useContinueTest } from '../hooks/useContinueTest';
import { useNavigate } from 'react-router-dom';

interface ContinueTestButtonProps {
  testId: string;
  onTestLoaded?: (testData: any, step: string) => void;
  className?: string;
}

export const ContinueTestButton: React.FC<ContinueTestButtonProps> = ({
  testId,
  onTestLoaded,
  className = '',
}) => {
  const { continueTest, loading } = useContinueTest();
  const navigate = useNavigate();

  const handleContinue = async () => {
    const result = await continueTest(testId);

    if (result) {
      // If there's a custom callback, use it
      if (onTestLoaded) {
        onTestLoaded(result.testData, result.nextStep);
        return;
      }

      // Automatic navigation based on the step
      const stepRoutes: Record<string, string> = {
        objective: '/create-test',
        search: '/create-test/search',
        variations: '/create-test/variations',
        competitors: '/create-test/competitors',
        demographics: '/create-test/demographics',
        preview: '/create-test/preview',
        review: '/create-test/review',
      };

      const route = stepRoutes[result.nextStep] || '/create-test';

      // Navigate to the corresponding step with loaded data
      navigate(route, {
        state: {
          testData: result.testData,
          testId: result.testId,
          isIncompleteTest: true,
          currentStep: result.nextStep,
        },
      });
    }
  };

  return (
    <button
      onClick={handleContinue}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
      {loading ? 'Loading...' : 'Continue'}
    </button>
  );
};

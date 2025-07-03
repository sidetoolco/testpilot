import { useState } from 'react';
import { testService } from '../services/testService';
import { TestData } from '../types';
import { toast } from 'sonner';

interface ContinueTestResult {
  testData: TestData;
  currentStep: string;
  lastCompletedStep: string;
  nextStep: string;
  testId: string;
}

export const useContinueTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continueTest = async (testId: string): Promise<ContinueTestResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await testService.continueIncompleteTest(testId);

      toast.success('Test loaded successfully');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error loading test';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    continueTest,
    loading,
    error,
  };
};

import { useState, useCallback } from 'react';
import { validateStep } from '../utils/validation';
import { TestData } from '../types';
import { toast } from 'sonner';

export const useStepValidation = (testData: TestData) => {
  const [currentStep, setCurrentStep] = useState<string>('objective');

  const canProceed = useCallback(() => {
    return validateStep(currentStep, testData);
  }, [currentStep, testData]);

  const getErrorMessage = useCallback(() => {
    switch (currentStep) {
      case 'search':
        return 'Please enter a search term';
      case 'competitors':
        return 'Please select exactly 10 competitor products';
      case 'variations':
        return 'Please select at least Variation A';
      case 'demographics':
        return 'Please complete all demographic selections';
      case 'review':
        return 'Please enter a test name';
      default:
        return 'Please complete all required fields';
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (!canProceed()) {
      toast.error(getErrorMessage());
      return false;
    }
    return true;
  }, [canProceed, getErrorMessage]);

  return {
    currentStep,
    setCurrentStep,
    canProceed,
    handleNext,
  };
};

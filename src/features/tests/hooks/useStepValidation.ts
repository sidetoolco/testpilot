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
        // Check for specific validation failures
        if (testData.demographics.customScreening.enabled) {
          return 'Please wait until your screening question is validated before proceeding';
        }
        if (testData.demographics.gender.length === 0) {
          return 'Please select at least one gender to continue';
        }
        if (testData.demographics.locations.length === 0) {
          return 'Please select at least one country to continue';
        }
        if (testData.demographics.ageRanges.length !== 2) {
          return 'Please set both minimum and maximum age';
        }
        if (testData.demographics.testerCount < 25 || testData.demographics.testerCount > 500) {
          return 'Please enter a valid number of testers (25-500)';
        }
        return 'Please complete all demographic selections';
      case 'review':
        return 'Please enter a test name';
      default:
        return 'Please complete all required fields';
    }
  }, [currentStep, testData.demographics]);

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

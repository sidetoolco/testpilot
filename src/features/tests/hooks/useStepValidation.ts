import { useState, useCallback } from 'react';
import { validateStep } from '../utils/validation';
import { TestData } from '../types';
import { toast } from 'sonner';
import { useCredits } from '../../credits/hooks/useCredits';

const CREDITS_PER_TESTER = 1;
const CREDITS_PER_TESTER_CUSTOM_SCREENING = 1.1;

export const useStepValidation = (testData: TestData) => {
  const [currentStep, setCurrentStep] = useState<string>('objective');
  
  // Get user's available credits
  const { data: creditsData } = useCredits();

  const canProceed = useCallback(() => {
    // First check basic step validation
    const basicValidation = validateStep(currentStep, testData);
    
    // If basic validation fails, return false
    if (!basicValidation) {
      return false;
    }
    
    // For the review step, only check basic validation (no credit validation)
    if (currentStep === 'review') {
      return true; // Credit validation is now handled in the ReviewStep component
    }
    
    return true;
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
        if (!testData.name.trim()) {
          return 'Please enter a test name';
        }
        return 'Please complete all required fields';
      default:
        return 'Please complete all required fields';
    }
  }, [currentStep, testData.demographics, testData.name, testData.variations]);

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

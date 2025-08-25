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
      case 'variations':
        if (!testData.name.trim()) {
          return 'Please enter a test name';
        }
        if (!testData.variations.a) {
          return 'Please select at least Variation A';
        }
        return 'Please complete all required fields';
      case 'search-term':
        if (!testData.searchTerm.trim()) {
          return 'Please enter a search term to define your competitive set';
        }
        if (!testData.skin) {
          return 'Please select an experience (Amazon or Walmart)';
        }
        return 'Please complete all required fields';
      case 'search-competitors':
        if (!testData.searchTerm.trim()) {
          return 'Please enter a search term';
        }
        if (testData.competitors.length !== 11) {
          return `Please select exactly 11 competitor products (currently selected: ${testData.competitors.length})`;
        }
        return 'Please complete all required fields';
      case 'demographics':
        // Check for specific validation failures
        if (testData.demographics.customScreening?.enabled) {
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
        return 'Please complete all required fields';
      default:
        return 'Please complete all required fields';
    }
  }, [currentStep, testData]);

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

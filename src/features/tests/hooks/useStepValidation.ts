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
    
    // For the review step, also check if user has sufficient credits
    if (currentStep === 'review') {
      const activeVariants = Object.values(testData.variations).filter(v => v !== null).length;
      const totalTesters = testData.demographics.testerCount * activeVariants;
      
      // Calculate credits based on custom screening
      const hasCustomScreening = testData.demographics.customScreening.enabled;
      const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
      const totalCredits = totalTesters * creditsPerTester;
      
      // Check if user has sufficient credits
      const availableCredits = creditsData?.total || 0;
      return availableCredits >= totalCredits;
    }
    
    return true;
  }, [currentStep, testData, creditsData?.total]);

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
        // Check for insufficient credits
        const activeVariants = Object.values(testData.variations).filter(v => v !== null).length;
        const totalTesters = testData.demographics.testerCount * activeVariants;
        const hasCustomScreening = testData.demographics.customScreening.enabled;
        const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
        const totalCredits = totalTesters * creditsPerTester;
        const availableCredits = creditsData?.total || 0;
        
        if (availableCredits < totalCredits) {
          const creditsNeeded = totalCredits - availableCredits;
          return `Insufficient credits. You need ${creditsNeeded.toFixed(1)} more credits to launch this test.`;
        }
        return 'Please complete all required fields';
      default:
        return 'Please complete all required fields';
    }
  }, [currentStep, testData.demographics, testData.name, testData.variations, creditsData?.total]);

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

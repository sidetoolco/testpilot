import { TestData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates test data according to the application's validation rules
 * @param testData - The test data to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateTestData(testData: TestData): ValidationResult {
  // Check if test name is provided
  if (!testData.name?.trim()) {
    return {
      isValid: false,
      errorMessage: 'Please enter a test name'
    };
  }

  // Check if variation A is provided
  if (!testData.variations.a) {
    return {
      isValid: false,
      errorMessage: 'Variation A is required'
    };
  }

  // Check if at least one competitor is selected
  if (testData.competitors.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Please select at least one competitor'
    };
  }

  // Check custom screening validation if enabled
  if (
    testData.demographics.customScreening?.enabled &&
    (!testData.demographics.customScreening.validAnswer || 
     testData.demographics.customScreening.isValidating)
  ) {
    return {
      isValid: false,
      errorMessage: 'Please enter and validate your screening question before proceeding'
    };
  }

  return { isValid: true };
}

/**
 * Validates test data and shows toast error if invalid
 * @param testData - The test data to validate
 * @param toast - The toast function to show errors
 * @returns True if validation passes, false otherwise
 */
export function validateTestDataWithToast(
  testData: TestData, 
  toast: { error: (message: string) => void }
): boolean {
  const validation = validateTestData(testData);
  
  if (!validation.isValid) {
    toast.error(validation.errorMessage!);
    return false;
  }
  
  return true;
} 

/**
 * Validates draft data with minimal requirements for saving drafts
 * @param testData - The test data to validate for draft
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateDraftData(testData: TestData): ValidationResult {
  // Only require essential fields for drafts
  if (!testData.name?.trim()) {
    return {
      isValid: false,
      errorMessage: 'Please enter a test name'
    };
  }

  if (!testData.searchTerm?.trim()) {
    return {
      isValid: false,
      errorMessage: 'Please enter a search term'
    };
  }

  return { isValid: true };
}

/**
 * Validates draft data and shows toast error if invalid
 * @param testData - The test data to validate for draft
 * @param toast - The toast function to show errors
 * @returns True if validation passes, false otherwise
 */
export function validateDraftDataWithToast(
  testData: TestData, 
  toast: { error: (message: string) => void }
): boolean {
  const validation = validateDraftData(testData);
  
  if (!validation.isValid) {
    toast.error(validation.errorMessage!);
    return false;
  }
  
  return true;
} 
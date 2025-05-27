import { TestData } from '../../types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateTestData(testData: TestData): ValidationResult {
  const errors: string[] = [];

  try {
    // Basic data validation
    if (!testData?.name?.trim()) {
      errors.push('Test name is required');
    }

    if (!testData?.searchTerm?.trim()) {
      errors.push('Search term is required');
    }

    // Validate competitors
    if (!Array.isArray(testData?.competitors)) {
      errors.push('Competitors must be an array');
    } else if (testData.competitors.length === 0) {
      errors.push('At least one competitor is required');
    } else {
      const invalidCompetitors = testData.competitors.filter(c => !c?.asin);
      console.log({ competitors: testData.competitors });
      if (invalidCompetitors.length > 0) {
        errors.push('All competitors must have valid IDs 1');
      }
    }

    // Validate variations
    if (!testData?.variations?.a?.id) {
      errors.push('Variation A is required');
    }

    // Validate demographics
    if (testData?.demographics) {
      const { ageRanges, gender, locations, testerCount } = testData.demographics;

      if (!Array.isArray(ageRanges) || ageRanges.length === 0) {
        errors.push('At least one age range is required');
      }

      if (!Array.isArray(gender) || gender.length === 0) {
        errors.push('At least one gender selection is required');
      }

      if (!Array.isArray(locations) || locations.length === 0) {
        errors.push('At least one location is required');
      }

      if (!testerCount || testerCount < 10) {
        errors.push('Minimum 10 testers required');
      }

      if (testData.demographics.customScreening.enabled) {
        if (!testData.demographics.customScreening.question?.trim()) {
          errors.push('Please enter a screening question to filter testers');
        }

        if (!testData.demographics.customScreening.validAnswer) {
          errors.push('Please enter the custom screening question valid answer');
        }
      }
    } else {
      errors.push('Demographics configuration is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error('Test validation error:', error);
    return {
      isValid: false,
      errors: ['An unexpected error occurred during validation'],
    };
  }
}

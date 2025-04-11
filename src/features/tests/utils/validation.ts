import { TestData } from '../types';

export const validateStep = (step: string, data: TestData): boolean => {
  switch (step) {
    case 'search':
      return data.searchTerm.trim().length > 0;

    case 'competitors':
      return data.competitors.length === 11; // Require exactly 10 competitors

    case 'variations':
      return data.variations.a !== null; // At least variation A is required

    case 'demographics':
      return (
        data.demographics.ageRanges.length === 2 &&
        data.demographics.gender.length > 0 &&
        data.demographics.locations.length > 0 &&
        data.demographics.testerCount >= 10 &&
        data.demographics.testerCount <= 500 &&
        data.demographics.interests.length > 0 
      );

    case 'preview':
      return true; // Preview can always proceed

    case 'review':
      return data.name.trim().length > 0;

    default:
      return false;
  }
};
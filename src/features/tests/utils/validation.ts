import { TestData } from '../types';

export const validateStep = (step: string, data: TestData): boolean => {
  switch (step) {
    case 'objective':
      return true; // The only time this function is called is after the user selects an objective, so its never going to be null.
    case 'search':
      return data.searchTerm.trim().length > 0;

    case 'competitors':
      return data.competitors.length === 11; // Require exactly 10 competitors

    case 'variations':
      return data.variations.a !== null; // At least variation A is required

    case 'demographics':
      const isValidDemographics =
        data.demographics.ageRanges.length === 2 &&
        data.demographics.gender.length > 0 &&
        data.demographics.locations.length > 0 &&
        data.demographics.testerCount >= 10 &&
        data.demographics.testerCount <= 500;
      // && data.demographics.interests.length > 0

      if (data.demographics.customScreening.enabled) {
        return (
          isValidDemographics &&
          !!data.demographics.customScreening.question?.trim().length &&
          !!data.demographics.customScreening.validAnswer &&
          !data.demographics.customScreening.isValidating
        );
      } else {
        return isValidDemographics;
      }

    case 'preview':
      return true; // Preview can always proceed

    case 'review':
      return data.name.trim().length > 0;

    default:
      return false;
  }
};

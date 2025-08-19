import { TestData } from '../types';

export const validateStep = (step: string, data: TestData): boolean => {
  switch (step) {
    case 'objective':
      return true; // The only time this function is called is after the user selects an objective, so its never going to be null.
    case 'variations':
      return data.variations.a !== null && data.name.trim().length > 0; // At least variation A is required and name is set

    case 'search-term':
      return data.searchTerm.trim().length > 0; // Require a non-empty search term

    case 'search-competitors':
      return data.searchTerm.trim().length > 0 && data.competitors.length === 11; // Require search term and exactly 11 competitors

    case 'skin-selection':
      return !!data.skin; // Require a skin to be selected

    case 'demographics':
      const isValidDemographics =
        data.demographics.ageRanges.length === 2 &&
        data.demographics.gender.length > 0 &&
        data.demographics.locations.length > 0 &&
        data.demographics.testerCount >= 25 &&
        data.demographics.testerCount <= 500;
      // && data.demographics.interests.length > 0

      if (data.demographics.customScreening?.enabled) {
        return (
          isValidDemographics &&
          !!data.demographics.customScreening.question?.trim().length &&
          !!data.demographics.customScreening.validAnswer &&
          !data.demographics.customScreening.isValidating
        );
      } else {
        return isValidDemographics;
      }

    case 'survey-questions':
      return data.surveyQuestions && data.surveyQuestions.length === 5;

    case 'preview':
      return true; // Preview can always proceed

    case 'review':
      return true; // Review can always proceed since name is now validated in variations step

    default:
      return false;
  }
};

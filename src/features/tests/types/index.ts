import { TestObjective } from '../../../lib/enum';
import { AmazonProduct } from '../../amazon/types';
import { WalmartProduct } from '../../walmart/services/walmartService';

export interface TestData {
  name: string;
  searchTerm: string;
  objective: TestObjective | null;
  competitors: (AmazonProduct | WalmartProduct)[];
  variations: {
    a: { id: string; name?: string } | null;
    b: { id: string; name?: string } | null;
    c: { id: string; name?: string } | null;
  };
  demographics: {
    ageRanges: string[];
    gender: string[];
    locations: string[];
    interests: string[];
    testerCount: number;
    customScreening: CustomScreening;
  };
  surveyQuestions: string[];
  skin: 'amazon' | 'walmart';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProductValidationResult {
  valid: boolean;
  products: Array<{ id: string; name: string }>;
  missingIds: string[];
}

export interface CustomScreening {
  enabled: boolean;
  valid?: boolean;
  isValidating?: boolean;
  question?: string;
  validAnswer?: 'Yes' | 'No';
}

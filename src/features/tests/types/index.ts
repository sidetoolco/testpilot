export interface TestData {
  name: string;
  searchTerm: string;
  competitors: Array<{
    id: string;
    name?: string;
  }>;
  variations: {
    a: { id: string; name?: string; } | null;
    b: { id: string; name?: string; } | null;
    c: { id: string; name?: string; } | null;
  };
  demographics: {
    ageRanges: string[];
    gender: string[];
    locations: string[];
    interests: string[];
    testerCount: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProductValidationResult {
  valid: boolean;
  products: Array<{ id: string; name: string; }>;
  missingIds: string[];
}
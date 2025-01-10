import { supabase } from '../../../lib/supabase';
import { ValidationError } from '../utils/errors';
import { TestData } from '../types';

export async function validateProducts(companyId: string, productIds: string[]) {
  // Deduplicate product IDs first
  const uniqueProductIds = [...new Set(productIds)];

  if (!uniqueProductIds.length) {
    throw new ValidationError('No products selected');
  }

  if (!companyId) {
    throw new ValidationError('Company ID is required');
  }

  try {
    // Query products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name')
      .eq('company_id', companyId)
      .in('id', uniqueProductIds);

    if (error) {
      throw new ValidationError('Database error during product validation', { error });
    }

    if (!products?.length) {
      throw new ValidationError('No products found');
    }

    const foundIds = new Set(products.map(p => p.id));
    const missingIds = uniqueProductIds.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new ValidationError('Some products are missing or invalid', {
        missingIds,
        foundProducts: products.map(p => ({ id: p.id, name: p.name }))
      });
    }

    return products;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Failed to validate products', { error });
  }
}

export function validateTestData(testData: TestData): void {
  if (!testData) {
    throw new ValidationError('Test data is required');
  }

  const errors: string[] = [];

  // Required fields validation
  if (!testData.name?.trim()) {
    errors.push('Test name is required');
  }

  if (!testData.searchTerm?.trim()) {
    errors.push('Search term is required');
  }

  // Competitors validation
  if (!Array.isArray(testData.competitors)) {
    errors.push('Competitors must be an array');
  } else if (testData.competitors.length === 0) {
    errors.push('At least one competitor is required');
  } else if (testData.competitors.some(c => !c?.id)) {
    errors.push('All competitors must have valid IDs');
  }

  // Variations validation
  if (!testData.variations) {
    errors.push('Variations are required');
  } else {
    if (!testData.variations.a?.id) {
      errors.push('Variation A is required');
    }
    // Optional variations B and C don't need validation
  }

  // Demographics validation
  if (!testData.demographics) {
    errors.push('Demographics are required');
  } else {
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
  }

  if (errors.length > 0) {
    throw new ValidationError('Test data validation failed', { errors });
  }
}
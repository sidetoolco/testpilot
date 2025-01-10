import { supabase } from '../../../../lib/supabase';
import { ValidationError } from '../errors';
import { Product } from '../../../../types';

export async function validateProducts(companyId: string, productIds: string[]): Promise<Product[]> {
  if (!productIds?.length) {
    throw new ValidationError('No products selected');
  }

  if (!companyId) {
    throw new ValidationError('Company ID is required');
  }

  try {
    // First verify products exist
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .in('id', productIds);

    if (error) {
      console.error('Product validation query error:', error);
      throw new ValidationError('Failed to validate products');
    }

    if (!products?.length) {
      throw new ValidationError('No products found');
    }

    // Check for missing products
    const foundIds = new Set(products.map(p => p.id));
    const missingIds = productIds.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new ValidationError('Some products not found', {
        missingIds,
        foundProducts: products.map(p => ({ id: p.id, name: p.name }))
      });
    }

    return products;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    console.error('Product validation error:', error);
    throw new ValidationError('Failed to validate products');
  }
}
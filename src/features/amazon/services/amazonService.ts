import { supabase } from '../../../lib/supabase';
import { AmazonProduct } from '../types';
import { ApiError } from '../utils/error';

export const amazonService = {
  async searchProducts(searchTerm: string, userId: string): Promise<AmazonProduct[]> {
    try {
      // Get user's company_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (profileError) throw new ApiError('Failed to fetch user profile', 'PROFILE_ERROR');
      if (!profile?.company_id) throw new ApiError('No company found for user', 'NO_COMPANY');

      // First try to get products from database
      const { data: existingProducts, error: dbError } = await supabase
        .from('amazon_products')
        .select('*')
        .eq('company_id', profile.company_id)
        .ilike('search_term', searchTerm)
        .order('reviews_count', { ascending: false });

      if (dbError) throw dbError;
      if (existingProducts?.length) return existingProducts;

      // If no products in DB, fetch from API
      const response = await fetch('https://sidetool.app.n8n.cloud/webhook/amazon-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm,
          companyId: profile.company_id
        })
      });

      if (!response.ok) {
        throw new ApiError('Failed to fetch from Amazon API', 'API_ERROR');
      }

      // After API call, query the database again for the products
      const { data: products, error: finalDbError } = await supabase
        .from('amazon_products')
        .select('*')
        .eq('company_id', profile.company_id)
        .ilike('search_term', searchTerm)
        .order('reviews_count', { ascending: false });

      if (finalDbError) throw finalDbError;
      if (!products?.length) {
        throw new ApiError('No products found', 'NO_PRODUCTS');
      }

      return products;

    } catch (error) {
      console.error('Amazon search error:', error);
      throw error;
    }
  }
};
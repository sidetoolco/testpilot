import { supabase } from '../../../lib/supabase';
import { AmazonProduct } from '../types';
import { toast } from 'sonner';

export const productService = {
  async getCachedProducts(searchTerm: string, companyId: string): Promise<AmazonProduct[]> {
    try {
      // Normalize search term
      const normalizedTerm = searchTerm.toLowerCase().trim();

      // Use optimized query with indexes
      const { data, error } = await supabase
        .from('amazon_products')
        .select('*')
        .eq('company_id', companyId)
        .ilike('search_term', normalizedTerm)
        .order('reviews_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database fetch error:', error);
      toast.error('Failed to fetch products from database');
      return [];
    }
  },

  async cacheProducts(products: AmazonProduct[]): Promise<void> {
    try {
      // Normalize products before caching
      const normalizedProducts = products.map(product => ({
        ...product,
        search_term: product.search_term.toLowerCase().trim(),
        title: product.title.trim(),
        price: Number(product.price),
        rating: Number(product.rating) || 0,
        reviews_count: Number(product.reviews_count) || 0,
      }));

      const { error } = await supabase.from('amazon_products').upsert(normalizedProducts, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Cache insert error:', error);
      toast.error('Failed to cache product data');
    }
  },
};

import { SearchProductsRequest, SearchProductsResponse } from '../types';
import { toast } from 'sonner';
import { validateProduct } from './validation';
import { retryWithBackoff } from './retry';

// Use Supabase Edge Function URL instead of external API
const API_URL = '/api/search-amazon';
const MAX_RETRIES = 3;

export async function fetchAmazonProducts(
  request: SearchProductsRequest
): Promise<SearchProductsResponse> {
  return retryWithBackoff(async () => {
    try {
      // Validate request
      if (!request.searchTerm?.trim()) {
        throw new Error('Search term is required');
      }

      if (!request.companyId) {
        throw new Error('Company ID is required');
      }

      // Use Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('search-amazon', {
        body: {
          searchTerm: request.searchTerm.trim(),
          companyId: request.companyId,
        },
      });

      if (error) {
        throw new Error(`API request failed: ${error.message}`);
      }

      if (!Array.isArray(data?.products)) {
        throw new Error('Invalid API response: missing or invalid products array');
      }

      // Validate and transform products
      const products = data.products.filter(validateProduct).map(product => ({
        id: product.id || crypto.randomUUID(),
        title: product.title.trim(),
        price: Number(product.price),
        rating: Number(product.rating) || 0,
        reviews_count: Number(product.reviews_count) || 0,
        image_url: product.image_url,
        product_url: product.product_url || '',
        search_term: request.searchTerm,
        company_id: request.companyId,
      }));

      if (!products.length) {
        throw new Error('No valid products found in API response');
      }

      return { products };
    } catch (error: any) {
      const message = error.message || 'Failed to fetch products from Amazon';
      console.error('API Error:', { error, request });
      toast.error(message);
      throw error;
    }
  }, MAX_RETRIES);
}

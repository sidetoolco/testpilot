import { supabase } from '../../../lib/supabase';
import { WalmartProduct, WalmartProductDetail } from './walmartService';
import { toast } from 'sonner';
import apiClient from '../../../lib/api';

export const walmartProductService = {
  async getCachedProducts(searchTerm: string, companyId: string): Promise<WalmartProduct[]> {
    try {
      // Normalize search term
      const normalizedTerm = searchTerm.toLowerCase().trim();

      // Use optimized query with indexes
      const { data, error } = await supabase
        .from('walmart_products')
        .select('*')
        .eq('company_id', companyId as string)
        .ilike('search_term', normalizedTerm)
        .order('reviews_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data as any[]) || [];
    } catch (error) {
      console.error('Database fetch error:', error);
      toast.error('Failed to fetch Walmart products from database');
      return [];
    }
  },

  async cacheProducts(products: WalmartProduct[], companyId: string): Promise<void> {
    try {
      // Normalize products before caching
      const normalizedProducts = products.map(product => ({
        walmart_id: product.walmart_id || '',
        title: product.title.trim(),
        price: Number(product.price) || 0,
        rating: Number(product.rating) || 0,
        reviews_count: Number(product.reviews_count) || 0,
        image_url: product.image_url || '',
        product_url: product.product_url || '',
        search_term: product.search_term || '',
        sold_by: product.seller || product.sold_by || '',
        product_availability: product.product_availability || product.availability || '',
        description: product.description || product.product_short_description || '',
        product_short_description: product.product_description || product.product_short_description || '',
        product_category: '', // Will be filled when we get full details
        brand: '', // Will be filled when we get full details
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('walmart_products').upsert(normalizedProducts as any, {
        onConflict: 'walmart_id',
        ignoreDuplicates: false,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Cache insert error:', error);
      toast.error('Failed to cache Walmart product data');
    }
  },

  async updateProductDetails(productId: string, details: WalmartProductDetail): Promise<void> {
    try {
      const { error } = await supabase
        .from('walmart_products')
        .update({
          product_short_description: details.product_short_description,
          product_category: details.product_category || '',
          brand: details.brand || '',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', productId as string);

      if (error) throw error;
    } catch (error) {
      console.error('Update product details error:', error);
      toast.error('Failed to update product details');
    }
  },

  async getProductById(walmartId: string): Promise<WalmartProduct | null> {
    try {
      const { data, error } = await supabase
        .from('walmart_products')
        .select('*')
        .eq('walmart_id', walmartId as string)
        .single();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Get product by ID error:', error);
      return null;
    }
  },

  // New method to fetch and save rich product details
  async fetchAndSaveRichDetails(products: WalmartProduct[]): Promise<void> {
    try {
      console.log('🔍 Fetching rich details for', products.length, 'products');
      
      for (const product of products) {
        if (product.walmart_id) {
          try {
            // Fetch rich details from Walmart API
            const { data: richDetails } = await apiClient.get<WalmartProductDetail>(
              `/walmart/products/walmart/${product.walmart_id}`
            );

            if (richDetails) {
              // Update the database with rich details
              const { error } = await supabase
                .from('walmart_products')
                .update({
                  title: richDetails.product_name || product.title, // Use existing 'title' column instead of 'product_name'
                  product_category: richDetails.product_category || '',
                  product_short_description: richDetails.product_short_description || '',
                  brand: richDetails.brand || '',
                  product_availability: (richDetails as any).product_availability || product.product_availability,
                  sold_by: (richDetails as any).sold_by || product.seller,
                  sku: (richDetails as any).sku || '',
                  gtin: (richDetails as any).gtin || '',
                  images: (richDetails as any).images ? JSON.stringify((richDetails as any).images) : null,
                  bullet_points: (richDetails as any).bullet_points ? JSON.stringify((richDetails as any).bullet_points) : null,
                  updated_at: new Date().toISOString(),
                } as any)
                .eq('walmart_id', product.walmart_id as string);

              if (error) {
                console.error(`Error updating rich details for ${product.walmart_id}:`, error);
              } else {
                console.log(`✅ Rich details saved for ${product.walmart_id}`);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch rich details for ${product.walmart_id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching and saving rich details:', error);
    }
  },
};

import apiClient from '../../../lib/api';

export interface WalmartProduct {
  id?: string; // Add optional id field for database records
  title: string;
  price: number;
  rating: number;
  reviews_count: number;
  image_url: string;
  product_url: string;
  search_term: string;
  seller: string;
  availability: string;
  created_at: string;
  updated_at: string;
  description?: string;
  product_description?: string;
  bullet_points?: string[];
  walmart_id?: string; // Walmart product ID (like "105XZBDBG2G0")
  url?: string; // Product URL for extracting Walmart ID
}

// New interface for full product details from the detail API
export interface WalmartProductDetail {
  product_name: string;
  product_short_description: string; // Changed from product_description
  product_category?: string;
  brand?: string;
  variants?: Array<{
    criteria: string;
    name: string;
    id: string;
    url: string;
    availability_status: string;
    variants: string[];
    price: number;
    price_currency: string;
    old_price?: number;
    old_price_currency?: string;
    images?: string[];
    thumbnail?: string;
  }>;
  // Include all the basic fields as well
  id: string;
  title?: string;
  price?: number;
  rating?: number;
  reviews_count?: number;
  image_url?: string;
  product_url?: string;
  search_term?: string;
  seller?: string;
  availability?: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  bullet_points?: string[];
}

export const walmartService = {
  async searchProducts(searchTerm: string): Promise<WalmartProduct[]> {
    try {
      const { data: products } = await apiClient.get<WalmartProduct[]>('/walmart/products', {
        params: { term: searchTerm },
      });
      if (!products.length) throw new Error('No products found');

      // Filter out duplicates and invalid products
      const filteredProducts = this.filterValidProducts(products);
      
      if (!filteredProducts.length) throw new Error('No valid products found after filtering');

      return filteredProducts;
    } catch (error: any) {
      console.error('Walmart search error:', error);
      return Promise.reject(error);
    }
  },

  // Helper method to filter out duplicates and invalid products
  filterValidProducts(products: WalmartProduct[]): WalmartProduct[] {
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    const validProducts: WalmartProduct[] = [];

    for (const product of products) {
      // Skip products with invalid data
      if (!product.walmart_id || !product.title || product.price <= 0 || !product.image_url) {
        continue;
      }

      // Skip duplicates based on walmart_id
      if (seenIds.has(product.walmart_id)) {
        continue;
      }

      // Skip duplicates based on title (normalized)
      const normalizedTitle = this.normalizeTitle(product.title);
      if (seenTitles.has(normalizedTitle)) {
        continue;
      }

      seenIds.add(product.walmart_id);
      seenTitles.add(normalizedTitle);
      validProducts.push(product);
    }

    return validProducts;
  },

  // Helper method to normalize product titles for comparison
  normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  },

  // Method to fetch saved product details from your database
  async getProductDetails(productId: string): Promise<WalmartProductDetail> {
    try {
      const { data: product } = await apiClient.get<WalmartProductDetail>(`/walmart/products/walmart/${productId}`);
      return product;
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      throw error;
    }
  },

  async getFreshWalmartProductDetails(productId: string): Promise<WalmartProductDetail | null> {
    try {
      const { data: product } = await apiClient.get<WalmartProductDetail>(`/walmart/products/walmart/${productId}`);
      return product;
    } catch (error) {
      console.error('Failed to fetch fresh product details:', error);
      return null;
    }
  },

  async saveProductsPreview(products: WalmartProduct[]): Promise<WalmartProduct[]> {
    try {

      const { data: savedProducts } = await apiClient.post<WalmartProduct[]>('/walmart/products', {
        products,
      });

      return savedProducts;
    } catch (error: any) {
      console.error('Walmart save preview error:', error);
      console.error('Walmart save preview error details:', {
        productCount: products.length,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      return Promise.reject(error);
    }
  },

  async saveProductsWithTest(products: WalmartProduct[], testId: string): Promise<WalmartProduct[]> {
    try {
      const { data: savedProducts } = await apiClient.post<WalmartProduct[]>(`/walmart/products/${testId}`, {
        products,
      });

      return savedProducts;
    } catch (error: any) {
      console.error('Walmart save with test error:', error);
      console.error('Walmart save with test error details:', {
        testId,
        productCount: products.length,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      // Log the full response data for debugging
      if (error.response?.data) {
        console.error('🔍 WalmartService: Full backend error response:', {
          message: error.response.data.message,
          error: error.response.data.error,
          statusCode: error.response.data.statusCode,
          details: error.response.data
        });
      }
      
      return Promise.reject(error);
    }
  },
};

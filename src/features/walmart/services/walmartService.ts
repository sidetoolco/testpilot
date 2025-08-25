import apiClient from '../../../lib/api';

export interface WalmartProduct {
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
      console.log('🔍 Walmart service: Searching for:', searchTerm);
      console.log('🔍 Walmart service: API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080');
      
      const { data: products } = await apiClient.get<WalmartProduct[]>('/walmart/products', {
        params: { term: searchTerm },
      });

      console.log('🔍 Walmart service: Raw API response:', products);
      console.log('🔍 Walmart service: First product sample:', products[0]);
      console.log('🔍 Walmart service: Product count:', products.length);
      
      // Log each product's available fields
      products.forEach((product, index) => {
        console.log(`🔍 Walmart service: Product ${index} fields:`, {
          title: product.title,
          description: product.description,
          product_description: product.product_description,
          bullet_points: product.bullet_points,
          hasDescription: !!(product.description || product.product_description || (product.bullet_points && product.bullet_points.length > 0)),
          allKeys: Object.keys(product),
          fullProduct: product
        });
      });

      if (!products.length) throw new Error('No products found');

      return products;
    } catch (error: any) {
      console.error('Walmart search error:', error);
      console.error('Walmart search error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      return Promise.reject(error);
    }
  },

  // Method to fetch saved product details from your database
  async getProductDetails(productId: string): Promise<WalmartProductDetail> {
    try {
      console.log('🔍 Walmart service: Fetching saved product details for:', productId);
      
      const { data: productDetails } = await apiClient.get<WalmartProductDetail>(`/walmart/products/saved/${productId}`);
      
      console.log('🔍 Walmart service: Saved product details received:', productDetails);
      
      return productDetails;
    } catch (error: any) {
      console.error('Walmart saved product details error:', error);
      console.error('Walmart saved product details error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      return Promise.reject(error);
    }
  },

  // Method to fetch fresh product details from Walmart API
  async getFreshWalmartProductDetails(walmartProductId: string): Promise<WalmartProductDetail> {
    try {
      console.log('🔍 Walmart service: Fetching fresh product details from Walmart for:', walmartProductId);
      
      const { data: productDetails } = await apiClient.get<WalmartProductDetail>(`/walmart/products/walmart/${walmartProductId}`);
      
      console.log('🔍 Walmart service: Fresh Walmart product details received:', productDetails);
      
      return productDetails;
    } catch (error: any) {
      console.error('Walmart fresh product details error:', error);
      console.error('Walmart fresh product details error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      return Promise.reject(error);
    }
  },

  async saveProductsPreview(products: WalmartProduct[]): Promise<WalmartProduct[]> {
    try {
      const { data: savedProducts } = await apiClient.post<WalmartProduct[]>('/walmart/products', {
        products,
      });

      return savedProducts;
    } catch (error) {
      console.error('Walmart save preview error:', error);
      return Promise.reject(error);
    }
  },

  async saveProductsWithTest(products: WalmartProduct[], testId: string): Promise<WalmartProduct[]> {
    try {
      console.log('🔍 WalmartService: Saving products with test ID:', testId);
      console.log('🔍 WalmartService: Products to save:', products);
      console.log('🔍 WalmartService: API endpoint:', `/walmart/products/${testId}`);
      
      // Log the exact data structure being sent
      const requestData = { products };
      console.log('🔍 WalmartService: Request payload:', JSON.stringify(requestData, null, 2));
      
      const { data: savedProducts } = await apiClient.post<WalmartProduct[]>(`/walmart/products/${testId}`, {
        products,
      });

      console.log('🔍 WalmartService: Products saved successfully:', savedProducts);
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

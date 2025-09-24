import { useState, useEffect } from 'react';
import { walmartService, WalmartProduct, WalmartProductDetail } from '../services/walmartService';
import { walmartProductService } from '../services/walmartProductService';
import { supabase } from '../../../lib/supabase';

export const useWalmartProducts = () => {
  const [products, setProducts] = useState<WalmartProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    // Clear products before each new search to prevent duplicates
    setProducts([]);
    setLoading(true);
    setError(null);
    
    try {
      const results = await walmartService.searchProducts(searchTerm);
      setProducts(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProductDetails = async (productId: string): Promise<WalmartProductDetail | null> => {
    try {
      return await walmartService.getProductDetails(productId);
    } catch (err: any) {
      console.error('Failed to fetch product details:', err);
      return null;
    }
  };

  const saveProducts = async (productsToSave: WalmartProduct[], testId?: string) => {
    try {
      if (testId) {
        return await walmartService.saveProductsWithTest(productsToSave, testId);
      } else {
        return await walmartService.saveProductsPreview(productsToSave);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getCachedProducts = async (searchTerm: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id as string)
        .single();

      if (!profile?.company_id) return [];

      return await walmartProductService.getCachedProducts(searchTerm, profile.company_id as string);
    } catch (error) {
      console.error('Failed to get cached products:', error);
      return [];
    }
  };

  return {
    products,
    loading,
    error,
    searchProducts,
    getProductDetails,
    saveProducts,
    getCachedProducts,
  };
};

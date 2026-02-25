import { useState } from 'react';
import { TikTokProduct } from '../types';
import { tiktokService } from '../services/tiktokService';

export const useTikTokProducts = () => {
  const [products, setProducts] = useState<TikTokProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async (searchTerm: string, region: string = 'US', page: number = 1) => {
    if (!searchTerm.trim()) return;

    setProducts([]);
    setLoading(true);
    setError(null);

    try {
      const results = await tiktokService.searchProducts(searchTerm, region, page);
      setProducts(results);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch TikTok products');
    } finally {
      setLoading(false);
    }
  };

  const getProductDetails = async (productId: string, region: string = 'US') => {
    try {
      return await tiktokService.getProductDetails(productId, region);
    } catch {
      return null;
    }
  };

  const saveProducts = async (productsToSave: TikTokProduct[], testId?: string) => {
    if (testId) {
      return tiktokService.saveProductsWithTest(productsToSave, testId);
    }
    return tiktokService.saveProductsPreview(productsToSave);
  };

  return {
    products,
    loading,
    error,
    searchProducts,
    getProductDetails,
    saveProducts,
  };
};

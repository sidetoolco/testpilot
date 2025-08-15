import { useState, useEffect } from 'react';
import { AmazonProduct } from '../types';
import { amazonService } from '../services/amazonService';

export function useProductFetch(searchTerm: string) {
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      if (!searchTerm?.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const products = await amazonService.searchProducts(searchTerm);
        if (mounted) {
          setProducts(products);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to fetch products');
          console.error('Product fetch error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, [searchTerm, refreshToken]);

  const refetch = () => setRefreshToken(t => t + 1);

  return { products, loading, error, refetch };
}

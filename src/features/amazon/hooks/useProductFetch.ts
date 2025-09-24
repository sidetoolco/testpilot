import { useState, useEffect } from 'react';
import { AmazonProduct } from '../types';
import { amazonService } from '../services/amazonService';

export function useProductFetch(searchTerm: string) {
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function fetchProducts() {
      if (!searchTerm?.trim()) {
        setProducts([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Clear products before each new search to prevent duplicates
      setProducts([]);
      setLoading(true);
      setError(null);

      try {
        const products = await amazonService.searchProducts(searchTerm);
        if (active) {
          setProducts(products);
        }
      } catch (err: unknown) {
        if (active && (err as any)?.name !== 'AbortError') {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
          setError(errorMessage);
          console.error('Product fetch error:', err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [searchTerm, refreshToken]);

  const refetch = () => setRefreshToken(t => t + 1);

  return { products, loading, error, refetch };
}

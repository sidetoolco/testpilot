import { useState, useEffect } from 'react';
import { AmazonProduct } from '../types';
import { amazonService } from '../services/amazonService';

export function useProductFetch(searchTerm: string, userId: string | undefined) {
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      if (!userId || !searchTerm?.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const products = await amazonService.searchProducts(searchTerm, userId);
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
  }, [searchTerm, userId]);

  return { products, loading, error };
}
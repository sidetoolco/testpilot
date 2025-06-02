import { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../auth/stores/authStore';

export function useProducts() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Get user's company_id first
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile?.company_id) throw new Error('No company found');

        // Then get products for that company
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [user?.id]);

  return { products, loading, error };
}

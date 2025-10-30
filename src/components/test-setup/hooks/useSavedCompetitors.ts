import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { AmazonProduct } from '../../../features/amazon/types';
import { WalmartProduct } from '../../../features/walmart/services/walmartService';

type Skin = 'amazon' | 'walmart';

interface UseSavedCompetitorsResult {
  products: (AmazonProduct | WalmartProduct)[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSavedCompetitors(skin: Skin): UseSavedCompetitorsResult {
  const [products, setProducts] = useState<(AmazonProduct | WalmartProduct)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id as any)
        .single();

      if (profileError || !profile?.company_id) {
        throw new Error('Company not found for user');
      }

      if (skin === 'walmart') {
        const { data, error } = await supabase
          .from('walmart_products')
          .select('*')
          .eq('company_id', profile.company_id as any)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts((data || []) as unknown as WalmartProduct[]);
      } else {
        const { data, error } = await supabase
          .from('amazon_products')
          .select('*')
          .eq('company_id', profile.company_id as any)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts((data || []) as unknown as AmazonProduct[]);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load saved competitors');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [skin]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}



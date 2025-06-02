import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AmazonProduct } from '../types';
import { toast } from 'sonner';

export const useAmazonProducts = (searchTerm: string) => {
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchTerm) return;

      setLoading(true);
      setError(null);

      try {
        const { data: profile } = await supabase.auth.getUser();
        if (!profile.user) throw new Error('Not authenticated');

        // Get user's company_id
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', profile.user.id)
          .single();

        if (profileError) throw profileError;
        if (!userProfile?.company_id) throw new Error('No company found');

        // Get products for the search term
        const { data, error } = await supabase
          .from('amazon_products')
          .select('*')
          .eq('company_id', userProfile.company_id)
          .ilike('search_term', searchTerm)
          .order('reviews_count', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        console.error('Error fetching Amazon products:', err);
        setError(err.message);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  return { products, loading, error };
};

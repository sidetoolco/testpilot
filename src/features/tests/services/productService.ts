import { supabase } from '../../../lib/supabase';
import { Product } from '../../../types';

export const productService = {
  async getProducts(userId: string): Promise<Product[]> {
    try {
      // Get user's company_id first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userId)
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
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
};
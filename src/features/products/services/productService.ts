import { supabase } from '../../../lib/supabase';
import { Product } from '../../../types';

export const productService = {
  async fetchProducts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) throw new Error('No company found');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addProduct(product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) throw new Error('No company found');

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price,
        brand: product.brand,
        image: product.image,
        images: product.images,
        star_rating: product.starRating,
        review_count: product.reviewCount,
        is_competitor: product.isCompetitor || false,
        best_seller: product.bestSeller || false,
        loads: product.loads || null,
        amazon_url: product.amazonUrl || null,
        company_id: profile.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        brand: updates.brand,
        image: updates.image,
        images: updates.images,
        star_rating: updates.starRating,
        review_count: updates.reviewCount,
        is_competitor: updates.isCompetitor,
        best_seller: updates.bestSeller,
        loads: updates.loads,
        amazon_url: updates.amazonUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
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
        title: product.title,
        description: product.description,
        price: product.price,
        brand: product.brand,
        image_url: product.image_url,
        images: product.images,
        rating: product.rating,
        reviews_count: product.reviews_count,
        is_competitor: product.isCompetitor || false,
        loads: product.loads || null,
        product_url: product.product_url || null,
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
        title: updates.title,
        description: updates.description,
        price: updates.price,
        brand: updates.brand,
        image_url: updates.image_url,
        images: updates.images,
        rating: updates.rating,
        reviews_count: updates.reviews_count,
        is_competitor: updates.isCompetitor,
        loads: updates.loads,
        product_url: updates.product_url,
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
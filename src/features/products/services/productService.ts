import { supabase } from '../../../lib/supabase';
import { Product } from '../../../types';

export const productService = {
  async getAuthenticatedUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    return user;
  },

  async getCompanyId(userId: string): Promise<string> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single();
    if (error) throw new Error('Error fetching company profile');
    if (!profile || !('company_id' in profile)) {
      throw new Error('No company found');
    }
    return (profile as any).company_id;
  },

  async fetchProducts() {
    const user = await this.getAuthenticatedUser();
    if (!user) throw new Error('Not authenticated');
    const companyId = await this.getCompanyId(user.id);

    const { data, error } = await supabase
      .from('products')
      .select(
        `
      *,
      companies (
        name
      )
    `
      )
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((product: any) => {
      const { companies, ...rest } = product;
      return {
        ...rest,
        brand: companies?.name || null,
      };
    });
  },

  async addProduct(product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const user = await this.getAuthenticatedUser();
    if (!user) throw new Error('Not authenticated');
    const companyId = await this.getCompanyId(user.id);

    const { data, error } = await supabase
      .from('products')
      .insert({
        title: product.title,
        description: product.description,
        bullet_points: product.bullet_points,
        price: product.price,
        image_url: product.image_url,
        images: product.images,
        rating: product.rating,
        reviews_count: product.reviews_count,
        is_competitor: product.isCompetitor || false,
        loads: product.loads || null,
        product_url: product.product_url || null,
        company_id: companyId,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    // Fetch the current product along with the company name
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(
        `
        *,
        company:companies(name)
      `
      )
      .eq('id', id)
      .single();

    if (productError || !productData) throw new Error('Error fetching product data');

    // Update the product with the new data
    const { data, error } = await supabase
      .from('products')
      .update({
        title: updates.title,
        description: updates.description,
        price: updates.price,
        image_url: updates.image_url,
        images: updates.images,
        rating: updates.rating,
        reviews_count: updates.reviews_count,
        is_competitor: updates.isCompetitor,
        bullet_points: updates.bullet_points,
        loads: updates.loads,
        product_url: updates.product_url,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Ensure data is an object before spreading
    const dataObject = typeof data === 'object' && data !== null ? data : {};

    // Add the brand to the returned data
    return {
      ...dataObject,
      brand: productData.company?.name || null,
    };
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) throw error;
  },
};

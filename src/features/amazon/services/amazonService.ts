import { supabase } from '../../../lib/supabase';
import { AmazonProduct } from '../types';
import { ApiError } from '../utils/error';

export const amazonService = {
  async searchProducts(searchTerm: string, userId: string): Promise<AmazonProduct[]> {
    try {
      const companyId = await getCompanyId(userId);

      let products = await fetchProductsFromDB(searchTerm, companyId);

      if (!products.length) {
        await fetchProductsFromAPI(searchTerm, companyId);
        products = await fetchProductsFromDB(searchTerm, companyId);
      }

      if (!products.length) throw new ApiError('No products found', 'NO_PRODUCTS');

      return products;
    } catch (error) {
      console.error('Amazon search error:', error);
      throw error;
    }
  }
};

type ProfileData = { company_id: string };

function isProfileData(profile: any): profile is ProfileData {
  return profile && typeof profile.company_id === 'string';
}

async function getCompanyId(userId: string): Promise<string> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .single();

  if (error) throw new ApiError('Failed to fetch user profile', 'PROFILE_ERROR');
  if (!isProfileData(profile)) throw new ApiError('No company found for user', 'NO_COMPANY');

  return profile.company_id;
}

async function fetchProductsFromDB(searchTerm: string, companyId: string): Promise<AmazonProduct[]> {
  const { data, error } = await supabase
    .from('amazon_products')
    .select('*')
    .eq('company_id', companyId)
    .ilike('search_term', searchTerm)
    .order('reviews_count', { ascending: false });

  if (error) throw new ApiError('Failed to fetch products from database', 'DB_ERROR');

  return filterUniqueValidProducts(data);
}

async function fetchProductsFromAPI(searchTerm: string, companyId: string): Promise<void> {
  const response = await fetch('https://sidetool.app.n8n.cloud/webhook/amazon-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ searchTerm, companyId })
  });

  if (!response.ok) {
    throw new ApiError('Failed to fetch from Amazon API', 'API_ERROR');
  }
}

function filterUniqueValidProducts(products: any[]): AmazonProduct[] {
  if (!Array.isArray(products)) return [];

  const validProducts = products.filter((product): product is AmazonProduct => {
    return typeof product === 'object' && product !== null && 'title' in product && typeof product.title === 'string';
  });

  return validProducts.reduce<AmazonProduct[]>((acc, product) => {
    if (!acc.some((p) => p.title === product.title)) {
      acc.push(product);
    }
    return acc;
  }, []);
}
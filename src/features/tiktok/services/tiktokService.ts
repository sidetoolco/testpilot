import apiClient from '../../../lib/api';
import { TikTokProduct } from '../types';

const normalizeProductsForSave = (products: TikTokProduct[]): TikTokProduct[] => {
  return products
    .filter(p => p?.tiktok_id && p?.title && Number(p?.price) > 0)
    .map(p => {
      const normalized: any = {
        tiktok_id: String(p.tiktok_id),
        title: String(p.title),
        image_url: p.image_url || '',
        price: Number(p.price),
        product_url: p.product_url || '',
        search_term: p.search_term || '',
        brand: p.brand ?? null,
      };

      if (typeof p.rating === 'number' && Number.isFinite(p.rating)) {
        normalized.rating = p.rating;
      }
      if (typeof p.reviews_count === 'number' && Number.isFinite(p.reviews_count)) {
        normalized.reviews_count = p.reviews_count;
      }

      return normalized;
    });
};

export const tiktokService = {
  async searchProducts(
    searchTerm: string,
    region: string = 'US',
    page: number = 1
  ): Promise<TikTokProduct[]> {
    const { data: products } = await apiClient.get<TikTokProduct[]>('/tiktok/products', {
      params: { term: searchTerm, region, page },
    });

    if (!products?.length) {
      throw new Error('No products found');
    }

    return products;
  },

  async getProductDetails(productId: string, region: string = 'US'): Promise<any> {
    const { data } = await apiClient.get(`/tiktok/products/tiktok/${productId}`, {
      params: { region },
    });
    return data;
  },

  async getSavedProductById(id: string): Promise<TikTokProduct> {
    const { data } = await apiClient.get<TikTokProduct>(`/tiktok/products/saved/${id}`);
    return data;
  },

  async saveProductsPreview(products: TikTokProduct[]): Promise<TikTokProduct[]> {
    const normalized = normalizeProductsForSave(products);
    const { data } = await apiClient.post<TikTokProduct[]>('/tiktok/products', {
      products: normalized,
    });
    return data;
  },

  async saveProductsWithTest(products: TikTokProduct[], testId: string): Promise<any> {
    const normalized = normalizeProductsForSave(products);
    const { data } = await apiClient.post(`/tiktok/products/${testId}`, {
      products: normalized,
    });
    return data;
  },
};

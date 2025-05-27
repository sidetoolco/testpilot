import { create } from 'zustand';
import { amazonService, AmazonProduct } from '../services/amazonService';
import { toast } from 'sonner';

interface AmazonStore {
  products: AmazonProduct[];
  loading: boolean;
  error: string | null;
  searchProducts: (searchTerm: string, companyId: string) => Promise<void>;
}

export const useAmazonStore = create<AmazonStore>(set => ({
  products: [],
  loading: false,
  error: null,

  searchProducts: async (searchTerm: string, companyId: string) => {
    try {
      set({ loading: true, error: null });
      const products = await amazonService.searchProducts(searchTerm, companyId);
      set({ products, loading: false });
    } catch (error: any) {
      const errorMessage = 'Failed to fetch Amazon products. Please try again.';
      set({ error: errorMessage, loading: false, products: [] });
      toast.error(errorMessage);
      throw error;
    }
  },
}));

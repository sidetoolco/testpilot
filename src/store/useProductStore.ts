import { create } from 'zustand';
import { Product } from '../types';
import { productService } from '../features/products/services/productService';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (
    product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>(set => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await productService.fetchProducts();
      set({ products, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addProduct: async productData => {
    set({ loading: true, error: null });
    try {
      const product = await productService.addProduct(productData);
      set(state => ({
        products: [product, ...state.products],
        loading: false,
      }));
      return product.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await productService.updateProduct(id, updates);
      set(state => ({
        products: state.products.map(p => (p.id === id ? updatedProduct : p)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProduct: async id => {
    set({ loading: true, error: null });
    try {
      await productService.deleteProduct(id);
      set(state => ({
        products: state.products.filter(p => p.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

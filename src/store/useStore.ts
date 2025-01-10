import { create } from 'zustand';
import { TestSession } from '../types';
import { sessions } from '../data/sessions';
import { Product } from '../lib/db';

interface Store {
  sessions: TestSession[];
  selectedSession: TestSession | null;
  setSelectedSession: (session: TestSession | null) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
}

const defaultProducts: Product[] = [
  {
    id: 'ds1',
    name: 'Dawn Ultra Dishwashing Liquid',
    description: 'Powerful dish soap that cuts through grease and makes dishes sparkle. Concentrated formula means a little goes a long way.',
    price: 7.99,
    image: 'https://m.media-amazon.com/images/I/61SSAhzy+xL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/61SSAhzy+xL.AC_UL320.jpg'],
    category: 'Dish Soap',
    brand: 'Dawn',
    rating: 4.9,
    reviews: 23412,
    isCompetitor: false,
    bestSeller: true,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bc1',
    name: 'Lysol Power Bathroom Cleaner',
    description: 'Professional-strength bathroom cleaner that eliminates soap scum and limescale. Kills 99.9% of bathroom bacteria and viruses.',
    price: 6.99,
    image: 'https://m.media-amazon.com/images/I/61zfsdWQLxL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/61zfsdWQLxL.AC_UL320.jpg'],
    category: 'Bathroom Cleaner',
    brand: 'Lysol',
    rating: 4.6,
    reviews: 8923,
    isCompetitor: false,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'af1',
    name: 'Febreze Air Freshener Spray',
    description: 'Long-lasting air freshener that eliminates odors and leaves a fresh scent. Perfect for any room in your home.',
    price: 5.99,
    image: 'https://m.media-amazon.com/images/I/71FxmK9qiHL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/71FxmK9qiHL.AC_UL320.jpg'],
    category: 'Air Freshener',
    brand: 'Febreze',
    rating: 4.7,
    reviews: 15632,
    isCompetitor: false,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ld2',
    name: 'Persil ProClean Liquid Laundry Detergent',
    description: 'Premium deep clean laundry detergent with pro-lift technology. Removes tough stains while keeping colors bright.',
    price: 17.99,
    image: 'https://m.media-amazon.com/images/I/71VSaspFGhL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/71VSaspFGhL.AC_UL320.jpg'],
    category: 'Laundry Detergent',
    brand: 'Persil',
    rating: 4.8,
    reviews: 7432,
    isCompetitor: false,
    loads: 96,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'apc2',
    name: 'Method All-Purpose Natural Surface Cleaner',
    description: 'Plant-based all-purpose cleaner that is tough on dirt but gentle on surfaces. Made with natural ingredients.',
    price: 9.99,
    image: 'https://m.media-amazon.com/images/I/81edBxfG+7L.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/81edBxfG+7L.AC_UL320.jpg'],
    category: 'All-Purpose Cleaner',
    brand: 'Method',
    rating: 4.7,
    reviews: 11234,
    isCompetitor: false,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const useStore = create<Store>((set) => ({
  sessions,
  selectedSession: null,
  setSelectedSession: (session) => set({ selectedSession: session }),
  products: defaultProducts,
  addProduct: (product) => set((state) => ({ 
    products: [...state.products, product] 
  })),
  updateProduct: (product) => set((state) => ({
    products: state.products.map(p => p.id === product.id ? product : p)
  })),
  deleteProduct: (productId) => set((state) => ({
    products: state.products.filter(p => p.id !== productId)
  })),
}));
// Shared product interface for both Amazon and Walmart skins
export interface Product {
  id: string | number;
  name: string;
  price: number;
  size?: string;
  imageUrl: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  discount?: number;
  availability?: string;
  shipping?: string;
  isPrime?: boolean; // Amazon-specific
  brand?: string;
  category?: string;
  description?: string;
  url?: string;
  inStock?: boolean;
  deliveryDate?: string;
  seller?: string;
}

// Common props for skin components
export interface SkinProps {
  products: Product[];
  isLoading?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onWishlistToggle?: (product: Product) => void;
  wishlistItems?: string[] | number[];
}

// Product search/filter options
export interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: 'inStock' | 'outOfStock' | 'all';
  brand?: string;
  sortBy?: 'price' | 'rating' | 'reviews' | 'name' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

// Cart item interface
export interface CartItem extends Product {
  quantity: number;
  addedAt: Date;
}

// Wishlist item interface
export interface WishlistItem extends Product {
  addedAt: Date;
}

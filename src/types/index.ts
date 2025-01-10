export interface Product {
  id: string;
  name: string;
  description: string;
  bulletPoints?: string[];
  price: number;
  image: string;
  images: string[];
  brand: string;
  position?: { row: number; column: number };
  starRating: number;
  reviewCount: number;
  isCompetitor?: boolean;
  bestSeller?: boolean;
  loads?: number;
  amazonUrl?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Test {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  searchTerm: string;
  competitors: Product[];
  variations: {
    a: Product | null;
    b: Product | null;
    c: Product | null;
  };
  demographics: {
    ageRanges: string[];
    gender: string[];
    locations: string[];
    interests: string[];
    testerCount: number;
  };
  createdAt: string;
  updatedAt: string;
}
import { Survey } from '../features/tests/components/Report/utils/types';

export interface Product {
  id: string | undefined;
  title: string; // Cambiado de 'name' a 'title'
  description: string;
  bullet_points: string[];
  price: number;
  image_url: string; // Cambiado de 'image' a 'image_url'
  images: string[];
  position?: { row: number; column: number };
  rating: number; // Cambiado de 'starRating' a 'rating'
  reviews_count: number; // Cambiado de 'reviewCount' a 'reviews_count'
  userId?: string;
  company_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  prolificStatus?: string | null;
}

export interface Test {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'complete' | 'incomplete';
  searchTerm: string;
  objective?: string;
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
    customScreening: {
      enabled?: boolean;
      question?: string;
      validAnswer?: 'Yes' | 'No';
    };
  };
  responses: {
    surveys: Survey[];
    comparisons: any[];
  };
  createdAt: string;
  updatedAt: string;
  completed_sessions: number;
  block?: boolean; // NEW FIELD: indicates if test is blocked (admin only)
}

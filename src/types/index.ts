import { Survey, Comparison } from '../features/tests/components/Report/utils/types';

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
  calculated_cost?: number;        
  last_cost_calculation?: string; 
  participant_count?: number;     
  reward_amount?: number;          
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
  surveyQuestions?: string[];
  responses: {
    surveys: {
      a: Survey[];
      b: Survey[];
      c: Survey[];
    };
    comparisons: {
      a: Comparison[];
      b: Comparison[];
      c: Comparison[];
    };
  };
  createdAt: string;
  updatedAt: string;
  completed_sessions: number;
  block?: boolean; // NEW FIELD: indicates if test is blocked (admin only)
  companyName?: string; // Company name for admin users
}

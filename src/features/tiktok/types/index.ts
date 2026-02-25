export interface TikTokProduct {
  id?: string;
  tiktok_id: string;
  title: string;
  price: number;
  rating: number | null;
  reviews_count: number | null;
  image_url: string;
  product_url: string;
  search_term: string;
  brand: string | null;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  description?: string;
  bullet_points?: string[];
  images?: string[];
}

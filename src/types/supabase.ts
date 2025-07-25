export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          company_id: string | null;
          role: 'owner' | 'admin' | null;
          email_confirmed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company_id?: string | null;
          role?: 'owner' | 'admin' | null;
          email_confirmed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company_id?: string | null;
          role?: 'owner' | 'admin' | null;
          email_confirmed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          waiting_list: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          waiting_list?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          waiting_list?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          bullet_points: string[] | null;
          price: number;
          image_url: string | null;
          images: string[] | null;
          rating: number | null;
          reviews_count: number | null;
          is_competitor: boolean;
          loads: number | null;
          product_url: string | null;
          company_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          bullet_points?: string[] | null;
          price: number;
          image_url?: string | null;
          images?: string[] | null;
          rating?: number | null;
          reviews_count?: number | null;
          is_competitor?: boolean;
          loads?: number | null;
          product_url?: string | null;
          company_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          bullet_points?: string[] | null;
          price?: number;
          image_url?: string | null;
          images?: string[] | null;
          rating?: number | null;
          reviews_count?: number | null;
          is_competitor?: boolean;
          loads?: number | null;
          product_url?: string | null;
          company_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tests: {
        Row: {
          id: string;
          name: string;
          search_term: string;
          status: string;
          company_id: string;
          user_id: string;
          settings: any;
          objective: string | null;
          step: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          search_term: string;
          status: string;
          company_id: string;
          user_id: string;
          settings?: any;
          objective?: string | null;
          step?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          search_term?: string;
          status?: string;
          company_id?: string;
          user_id?: string;
          settings?: any;
          objective?: string | null;
          step?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invites: {
        Row: {
          id: string;
          email: string;
          company_id: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          company_id: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          company_id?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      amazon_products: {
        Row: {
          id: string;
          asin: string;
          title: string;
          price: number | null;
          rating: number | null;
          reviews_count: number | null;
          image_url: string | null;
          company_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          asin: string;
          title: string;
          price?: number | null;
          rating?: number | null;
          reviews_count?: number | null;
          image_url?: string | null;
          company_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          asin?: string;
          title?: string;
          price?: number | null;
          rating?: number | null;
          reviews_count?: number | null;
          image_url?: string | null;
          company_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

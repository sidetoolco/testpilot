export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invites: {
        Row: {
          id: number;
          email: string;
          company_id: string;
          token: string;
          expires_at: string;
        };
        Insert: {
          id?: number;
          email: string;
          company_id: string;
          token: string;
          expires_at: string;
        };
        Update: {
          id?: number;
          email?: string;
          company_id?: string;
          token?: string;
          expires_at?: string;
        };
      };
    };
  };
}

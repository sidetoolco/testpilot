export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin';
  company_id: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  waiting_list?: boolean;
}

export interface Company {
  id: string;
  name: string;
}

export interface FormData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  role: 'owner' | 'admin';
} 
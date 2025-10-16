export interface Transaction {
  id: string;
  type: 'payment' | 'usage' | 'admin_adjustment';
  amount_cents?: number;
  credits: number;
  status: string;
  test_id?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreditsData {
  total: number;
  transactions: {
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminCreditsData extends CreditsData {
  company_id: string;
  company_name: string;
}

export interface AdminEditCreditsRequest {
  company_id: string;
  credits: number;
  description: string;
}

export interface AdminEditCreditsResponse {
  success: boolean;
  message: string;
  transaction: {
    id: string;
    type: 'admin_adjustment';
    credits: number;
    status: string;
    description: string;
    created_at: string;
  };
  new_balance: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

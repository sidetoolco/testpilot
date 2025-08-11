import apiClient from '../../../lib/api';
import { CreditsData, PaymentIntentResponse } from '../../../types/credits';

export interface CouponValidationResponse {
  valid: boolean;
  coupon?: {
    id: string;
    name: string;
    percent_off?: number;
    amount_off?: number;
    currency?: string;
  };
  error?: string;
}

export const creditsService = {
  async getCompanyCredits(page = 1, limit = 20): Promise<CreditsData> {
    const { data } = await apiClient.get<CreditsData>('/credits', {
      params: { page, limit },
    });
    return data;
  },

  async createPaymentIntent(credits: number, couponId?: string): Promise<PaymentIntentResponse> {
    const requestBody: any = { credits };
    
    if (couponId) {
      requestBody.couponId = couponId;
    }
    
    const { data } = await apiClient.post<PaymentIntentResponse>('/stripe/payment-intent', requestBody);
    return data;
  },

  async processMyPending(): Promise<void> {
    const { data } = await apiClient.post('/credits/process-my-pending');
    return data;
  },

  async validateCoupon(couponCode: string): Promise<CouponValidationResponse> {
    try {
      const safeCode = encodeURIComponent(couponCode);
      const { data } = await apiClient.get<CouponValidationResponse>(`/stripe/coupons/validate/${safeCode}`);
      return data;
    } catch (error: any) {
      
      // Handle different types of errors
      if (error.response?.status === 404) {
        return {
          valid: false,
          error: 'Coupon not found',
        };
      }
      
      if (error.response?.status === 401) {
        return {
          valid: false,
          error: 'Authentication required',
        };
      }
      
      if (error.response?.status === 400) {
        return {
          valid: false,
          error: error.response?.data?.message || 'Invalid coupon code format',
        };
      }
      
      // Generic error handling
      return {
        valid: false,
        error: error.response?.data?.message || 'Failed to validate coupon',
      };
    }
  },
};
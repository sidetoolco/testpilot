import apiClient from '../../../lib/api';
import { CreditsData, PaymentIntentResponse } from '../../../types/credits';

export const creditsService = {
  async getCompanyCredits(page = 1, limit = 20): Promise<CreditsData> {
    const { data } = await apiClient.get<CreditsData>('/credits', {
      params: { page, limit },
    });

    return data;
  },

  async createPaymentIntent(credits: number): Promise<PaymentIntentResponse> {
    const { data } = await apiClient.post<PaymentIntentResponse>('/stripe/payment-intent', {
      credits,
    });

    return data;
  },
};

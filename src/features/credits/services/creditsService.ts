import apiClient from '../../../lib/api';
import { CreditsData } from '../../../types/credits';

export const creditsService = {
  async getCompanyCredits(page = 1, limit = 20): Promise<CreditsData> {
    const { data } = await apiClient.get<CreditsData>('/credits', {
      params: { page, limit },
    });

    return data;
  },
};

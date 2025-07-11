import { useQuery } from '@tanstack/react-query';
import { creditsService } from '../services/creditsService';

export const useCredits = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['credits', page, limit],
    queryFn: () => creditsService.getCompanyCredits(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

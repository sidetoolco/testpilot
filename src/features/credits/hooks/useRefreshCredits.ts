import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { creditsService } from '../services/creditsService';

interface RefreshCreditsOptions {
  silent?: boolean;
}

export const useRefreshCredits = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const refreshCredits = async (options: RefreshCreditsOptions = {}) => {
    try {
      setIsRefreshing(true);
      
      // Process pending payments to add credits
      await creditsService.processMyPending();
      
      // Refresh credit data
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      
      // Only show success toast if not silent
      if (!options.silent) {
        toast.success('Credits refreshed successfully!');
      }
      
      return true;
    } catch (error) {
      console.error('Manual refresh failed:', error);
      
      // Only show error toast if not silent
      if (!options.silent) {
        toast.error('Failed to refresh credits. Please try again later.');
      }
      
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    refreshCredits,
    isRefreshing,
  };
};

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../features/auth/stores/authStore';

export function useWaitingList() {
  const { user } = useAuthStore();
  const [isWaitingList, setIsWaitingList] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkWaitingListStatus() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // First get the user's company_id from their profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile?.company_id) throw new Error('No company found');

        // Then check the company's waiting list status
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('waiting_list')
          .eq('id', profile.company_id)
          .single();

        if (companyError) throw companyError;
        setIsWaitingList(company?.waiting_list ?? true);
        setError(null);
      } catch (err) {
        console.error('Error checking waiting list status:', err);
        setError(err instanceof Error ? err : new Error('Failed to check waiting list status'));
        setIsWaitingList(true); // Default to waiting list if there's an error
      } finally {
        setLoading(false);
      }
    }

    checkWaitingListStatus();
  }, [user?.id]);

  return { isWaitingList, loading, error };
}
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../features/auth/stores/authStore';
import { toast } from 'sonner';

export function useWaitingListStatus() {
  const { user } = useAuthStore();
  const [isWaitingList, setIsWaitingList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

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

        if (mounted) {
          if (companyError) throw companyError;
          setIsWaitingList(company?.waiting_list ?? false);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error checking waiting list status:', err);
        if (mounted) {
          const handledError = supabase.handleError(err);
          setError(handledError);
          setIsWaitingList(false);
          toast.error(handledError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkWaitingListStatus();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return { isWaitingList, loading, error };
}
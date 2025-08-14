import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../features/auth/stores/authStore';

export function useExpertMode() {
  const { user } = useAuthStore();
  const [expertMode, setExpertMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkExpertMode() {
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

        // Then check the company's expert mode status
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('expert_mode')
          .eq('id', profile.company_id)
          .single();

        if (mounted) {
          if (companyError) throw companyError;
          setExpertMode(company?.expert_mode ?? false);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error checking expert mode status:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to check expert mode status'));
          setExpertMode(false); // Default to false if there's an error
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkExpertMode();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return { expertMode, loading, error };
}

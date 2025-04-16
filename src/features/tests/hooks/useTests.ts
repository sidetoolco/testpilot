import { useState, useEffect } from 'react';
import { Test } from '../../../types';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { testService } from '../services/testService';

export function useTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTests() {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        let data;
        if (profile?.role === 'admin') {
          // If admin, fetch all tests
          data = await testService.getAllTests();
        } else {
          // If not admin, fetch only user's company tests
          const { data: userTests, error } = await supabase
            .from('tests')
            .select(`
              *,
              competitors:test_competitors(
                product:amazon_products(
                  *,
                  company:companies(name)
                )
              ),
              variations:test_variations(
                product:products(
                  *,
                  company:companies(name)
                ),
                variation_type
              ),
              demographics:test_demographics(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          data = userTests;
        }

        // Transform the data to match our Test type
        const transformedTests: Test[] = (data || []).map(test => ({
          id: test.id,
          name: test.name,
          status: test.status,
          searchTerm: test.search_term,
          competitors: test.competitors?.map((c: any) => c.product) || [],
          variations: {
            a: test.variations?.find((v: any) => v.variation_type === 'a')?.product || null,
            b: test.variations?.find((v: any) => v.variation_type === 'b')?.product || null,
            c: test.variations?.find((v: any) => v.variation_type === 'c')?.product || null
          },
          demographics: {
            ageRanges: test.demographics?.[0]?.age_ranges || [],
            gender: test.demographics?.[0]?.genders || [],
            locations: test.demographics?.[0]?.locations || [],
            interests: test.demographics?.[0]?.interests || [],
            testerCount: test.demographics?.[0]?.tester_count || 0
          },
          createdAt: test.created_at,
          updatedAt: test.updated_at
        }));

        setTests(transformedTests);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tests:', err);
        setError(err.message);
        toast.error('Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    }

    fetchTests();
  }, []);

  return { tests, loading, error };
}
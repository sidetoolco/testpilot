import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Test } from '../../../types';
import { toast } from 'sonner';

export function useTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTests() {
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) {
          throw new Error('Usuario no autenticado');
        }

        const { data, error } = await supabase
          .from('tests')
          .select(`
            *,
            competitors:test_competitors(
              product:amazon_products(*)
            ),
            variations:test_variations(
              product:products(*),
              variation_type
            ),
            demographics:test_demographics(
              age_ranges,
              genders,
              locations,
              interests,
              tester_count
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

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
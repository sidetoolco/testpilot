import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Test } from '../../../types';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks/useAuth';

export function useTestDetail(id: string) {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!id) return;

    const fetchTest = async () => {
      try {
        if (!userId) throw new Error('Usuario no autenticado');

        // Fetch test data
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select(`
            id,
            name,
            status,
            search_term,
            created_at,
            competitors:test_competitors(
              product:amazon_products(id, title, image_url, price)
            ),
            variations:test_variations(
              product:products(id, title, image_url, price),
              variation_type
            ),
            demographics:test_demographics(
              age_ranges, genders, locations, interests, tester_count
            )
          `)
          .eq('user_id', userId)
          .eq('id', id)
          .single();

        if (testError || !testData) throw testError || new Error('Test not found');

        // Parallel fetching of responses
        const [surveysRes, comparisonsRes] = await Promise.all([
          supabase
            .from('responses_surveys')
            .select(` 
              improve_suggestions,
              likes_most,
              products(id, title, image_url, price),
              tester_id(
                variation_type,
                id,
                prolific_pid,
                shopper_demographic(id_prolific, age, sex, country_residence)
              )
            `)
            .eq('test_id', id),
          supabase
            .from('responses_comparisons')
            .select(`
              improve_suggestions,
              likes_most,
              products(id, title, image_url, price),
              amazon_products(id, title, image_url, price),
              tester_id(
                variation_type,
                id,
                prolific_pid,
                shopper_demographic(id_prolific, age, sex, country_residence)
              )
            `)
            .eq('test_id', id)
        ]);

        if (surveysRes.error) throw surveysRes.error;
        if (comparisonsRes.error) throw comparisonsRes.error;

        const groupByType = (data: any[]) =>
          data.reduce((acc: Record<string, any[]>, item) => {
            const type = item.tester_id.variation_type;
            (acc[type] = acc[type] || []).push(item);
            return acc;
          }, {});

        const transformedTest: Test = {
          id: testData.id,
          name: testData.name,
          status: testData.status,
          searchTerm: testData.search_term,
          competitors: testData.competitors?.map(c => c.product) || [],
          variations: {
            a: testData.variations?.find(v => v.variation_type === 'a')?.product || null,
            b: testData.variations?.find(v => v.variation_type === 'b')?.product || null,
            c: testData.variations?.find(v => v.variation_type === 'c')?.product || null
          },
          demographics: {
            ageRanges: testData.demographics?.[0]?.age_ranges || [],
            gender: testData.demographics?.[0]?.genders || [],
            locations: testData.demographics?.[0]?.locations || [],
            interests: testData.demographics?.[0]?.interests || [],
            testerCount: testData.demographics?.[0]?.tester_count || 0
          },
          completed_sessions: (surveysRes.data?.length || 0) + (comparisonsRes.data?.length || 0),
          responses: {
            surveys: groupByType(surveysRes.data || []),
            comparisons: groupByType(comparisonsRes.data || [])
          },
          createdAt: testData.created_at,
          updatedAt: testData.updated_at
        };

        setTest(transformedTest);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching test:', err);
        setError(err.message);
        toast.error('Failed to fetch test');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id]);

  return { test, loading, error };
}

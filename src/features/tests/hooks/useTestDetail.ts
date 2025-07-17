import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Test } from '../../../types';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks/useAuth';

type TestResponse = {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'complete' | 'incomplete';
  search_term: string;
  objective?: string;
  created_at: string;
  updated_at: string;
  competitors: Array<{ product: any }>;
  variations: Array<{ product: any; variation_type: string; prolific_status: string | null }>;
  demographics: Array<{
    age_ranges: string[];
    genders: string[];
    locations: string[];
    interests: string[];
    tester_count: number;
  }>;
  custom_screening: Array<{
    question: string;
    valid_option: 'Yes' | 'No';
  }>;
  completed_sessions: number;
};

const getVariationWithProduct = (
  variations: Array<{ product: any; variation_type: string; prolific_status: string | null }>,
  type: 'a' | 'b' | 'c'
) => {
  const variation = variations?.find(v => v.variation_type === type);
  return variation ? { ...variation.product, prolificStatus: variation.prolific_status } : null;
};

export function useTestDetail(id: string) {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    async function fetchTest() {
      try {
        if (!userId) {
          throw new Error('Usuario no autenticado');
        }

        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select(
            `
            id,
            name,
            status,
            search_term,
            objective,
            created_at,
            competitors:test_competitors(
              product:amazon_products(id, title, image_url, price)
            ),
            variations:test_variations(
              product:products(id, title, image_url, price),
              variation_type,
              prolific_status
            ),
            demographics:test_demographics(
              age_ranges, genders, locations, interests, tester_count
            ),
            custom_screening:custom_screening(
              question, valid_option
            )
          `
          )
          .eq('id', id)
          .single();
        // .eq('user_id', userId)

        if (testError) throw testError;
        if (!testData) throw new Error('Test not found');

        const typedTestData = testData as unknown as TestResponse;

        // Fetch survey responses for the test
        const { data: surveysData, error: surveysError } = await supabase
          .from('responses_surveys')
          .select(
            ` 
            improve_suggestions,
            likes_most,
            products(id, title, image_url, price),
            tester_id(
              variation_type,
              id,
              prolific_pid,
              shopper_demographic(id_prolific, age, sex, country_residence)
            )
          `
          )
          .eq('test_id', id);

        if (surveysError) throw surveysError;

        // Separate surveys by variation_type
        const surveysByType = surveysData.reduce((acc: any, item: any) => {
          const type = item.tester_id.variation_type;
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(item);
          return acc;
        }, {});

        // Fetch comparison responses for the test
        const { data: comparisonsData, error: comparisonsError } = await supabase
          .from('responses_comparisons')
          .select(
            `
          improve_suggestions,
          likes_most,
          choose_reason,
          competitor_id,
          products(id, title, image_url, price),
          amazon_products(id, title, image_url, price),
          tester_id(
            variation_type,
            id,
            prolific_pid,
            shopper_demographic (
              id_prolific,
              age,
              sex,
              country_residence
            )
          )
        `
          )
          .eq('test_id', id);

        if (comparisonsError) throw comparisonsError;

        // Separate comparisons by variation_type
        const comparisonsByType = comparisonsData.reduce((acc: any, item: any) => {
          const type = item.tester_id.variation_type;
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(item);
          return acc;
        }, {});

        // Transform the data to match our Test type
        const transformedTest: Test = {
          id: typedTestData.id,
          name: typedTestData.name,
          status: typedTestData.status,
          searchTerm: typedTestData.search_term,
          competitors: typedTestData.competitors?.map(c => c.product) || [],
          objective: typedTestData.objective,
          variations: {
            a: getVariationWithProduct(typedTestData.variations, 'a'),
            b: getVariationWithProduct(typedTestData.variations, 'b'),
            c: getVariationWithProduct(typedTestData.variations, 'c'),
          },
          demographics: {
            ageRanges: typedTestData.demographics?.[0]?.age_ranges || [],
            gender: typedTestData.demographics?.[0]?.genders || [],
            locations: typedTestData.demographics?.[0]?.locations || [],
            interests: typedTestData.demographics?.[0]?.interests || [],
            testerCount: typedTestData.demographics?.[0]?.tester_count || 0,
            customScreening: {
              question: typedTestData.custom_screening?.[0]?.question || '',
              validAnswer:
                (typedTestData.custom_screening?.[0]?.valid_option as 'Yes' | 'No') || undefined,
            },
          },
          completed_sessions: (surveysData?.length || 0) + (comparisonsData?.length || 0),
          responses: {
            surveys: surveysByType,
            comparisons: comparisonsByType,
          },
          createdAt: typedTestData.created_at,
          updatedAt: typedTestData.updated_at,
        };

        setTest(transformedTest);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching test:', err);
        setError(err.message);
        toast.error('Failed to fetch test');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTest();
    }
  }, [id]);

  return { test, loading, error };
}

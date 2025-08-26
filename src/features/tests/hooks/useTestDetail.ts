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

        // Fetch test data without complex joins
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select(`
            id,
            name,
            status,
            search_term,
            objective,
            created_at,
            variations:test_variations(
              product:products(id, title, image_url, price),
              variation_type,
              prolific_status
            ),
            demographics:test_demographics(
              age_ranges,
              genders,
              locations,
              interests,
              tester_count
            ),
            custom_screening:custom_screening(
              question,
              valid_option
            )
          `)
          .eq('id', id as any)
          .single();

        if (testError) {
          console.error('Error fetching test:', testError);
          throw testError;
        }

        // Fetch competitors separately to avoid join issues
        const { data: competitorsData, error: competitorsError } = await supabase
          .from('test_competitors')
          .select(`
            id,
            product_id
          `)
          .eq('test_id', id as any);

        if (competitorsError) {
          console.error('Error fetching competitors:', competitorsError);
        }

        // Fetch competitor products using batch queries instead of individual calls
        let competitors = [];
        if (competitorsData && competitorsData.length > 0) {
          // Extract all product IDs
          const productIds = competitorsData
            .map((comp: any) => comp.product_id)
            .filter(Boolean);
          
          if (productIds.length > 0) {
            // Batch query amazon_products
            const { data: amazonProducts, error: amazonError } = await supabase
              .from('amazon_products')
              .select('id, title, image_url, price')
              .in('id', productIds);
            
            if (amazonError) {
              console.error('Error fetching amazon products:', amazonError);
            }
            
            // Batch query walmart_products
            const { data: walmartProducts, error: walmartError } = await supabase
              .from('walmart_products')
              .select('id, title, image_url, price')
              .in('id', productIds);
            
            if (walmartError) {
              console.error('Error fetching walmart products:', walmartError);
            }
            
            // Combine and deduplicate products
            const allProducts = [
              ...(amazonProducts || []),
              ...(walmartProducts || [])
            ];
            
            // Create a map for quick lookup
            const productMap = new Map();
            allProducts.forEach((product: any) => {
              if (product && typeof product === 'object' && 'id' in product) {
                productMap.set(product.id, product);
              }
            });
            
            // Map competitors to their products
            competitors = competitorsData
              .map((comp: any) => {
                if (comp.product_id && productMap.has(comp.product_id)) {
                  return productMap.get(comp.product_id);
                }
                return null;
              })
              .filter(Boolean);
          }
        }

        // Debug: Log the raw data from database
        console.log('Raw test data from database:', testData);

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
          .eq('test_id', id as any);

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
          .eq('test_id', id as any);

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
          competitors: competitors || [], // Use the competitors we fetched separately
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
          surveyQuestions: ['value', 'appearance', 'confidence', 'brand', 'convenience'],
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

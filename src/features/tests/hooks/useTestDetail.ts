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

        if (testError) throw testError;
        if (!testData) throw new Error('Test not found');

        // Debug: Log the raw data from database
        console.log('Raw test data from database:', testData);

        const typedTestData = testData as unknown as TestResponse;

        // Fetch competitors separately to avoid join issues
        const { data: competitorsData, error: competitorsError } = await supabase
          .from('test_competitors')
          .select(`
            id,
            product_id
          `)
          .eq('test_id', id);

        if (competitorsError) {
          console.error('Error fetching competitors:', competitorsError);
        }

        // Fetch competitor products based on available IDs
        let competitors = [];
        if (competitorsData && competitorsData.length > 0) {
          const competitorPromises = competitorsData.map(async (comp) => {
            // Try to find the product in amazon_products first
            let product = null;
            
            // Check amazon_products
            const { data: amazonProduct } = await supabase
              .from('amazon_products')
              .select('id, title, image_url, price')
              .eq('id', comp.product_id)
              .single();
            
            if (amazonProduct) {
              product = amazonProduct;
            } else {
              // Check walmart_products
              const { data: walmartProduct } = await supabase
                .from('walmart_products')
                .select('id, title, image_url, price')
                .eq('id', comp.product_id)
                .single();
              
              if (walmartProduct) {
                product = walmartProduct;
              }
            }
            
            return product;
          });

          const competitorResults = await Promise.all(competitorPromises);
          competitors = competitorResults.filter(Boolean);
        }

        // Add competitors to the test data
        const testDataWithCompetitors = {
          ...typedTestData,
          competitors: competitors.map(comp => ({ product: comp }))
        };

        // Fetch survey responses for the test
        const { data: surveysData, error: surveysError } = await supabase
          .from('responses_surveys')
          .select(
            ` 
            improve_suggestions,
            likes_most,
            product_id,
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

        // Separate surveys by variation_type and map product data
        const surveysByType = surveysData.reduce((acc: any, item: any) => {
          const type = item.tester_id.variation_type;
          if (!acc[type]) {
            acc[type] = [];
          }
          
          // Map the product_id to the actual product data from test_variations
          const productData = typedTestData.variations?.find(v => v.product.id === item.product_id)?.product;
          
          // Create the item with the correct product data
          const mappedItem = {
            ...item,
            products: productData || null
          };
          
          acc[type].push(mappedItem);
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
          product_id,
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

        // Transform the data to match our Test type
        const transformedTest: Test = {
          id: testDataWithCompetitors.id,
          name: testDataWithCompetitors.name,
          status: testDataWithCompetitors.status as 'draft' | 'active' | 'complete' | 'incomplete',
          searchTerm: testDataWithCompetitors.search_term,
          objective: testDataWithCompetitors.objective,
          competitors: testDataWithCompetitors.competitors?.map((c: any) => c.product) || [],
          variations: {
            a: getVariationWithProduct(testDataWithCompetitors.variations, 'a'),
            b: getVariationWithProduct(testDataWithCompetitors.variations, 'b'),
            c: getVariationWithProduct(testDataWithCompetitors.variations, 'c'),
          },
          demographics: {
            ageRanges: testDataWithCompetitors.demographics?.[0]?.age_ranges || [],
            gender: testDataWithCompetitors.demographics?.[0]?.genders || [],
            locations: testDataWithCompetitors.demographics?.[0]?.locations || [],
            interests: testDataWithCompetitors.demographics?.[0]?.interests || [],
            testerCount: testDataWithCompetitors.demographics?.[0]?.tester_count || 0,
            customScreening: {
              enabled: !!testDataWithCompetitors.custom_screening?.[0],
              question: testDataWithCompetitors.custom_screening?.[0]?.question || '',
              validAnswer: (() => {
                const validOption = testDataWithCompetitors.custom_screening?.[0]?.valid_option;
                return validOption === 'Yes' || validOption === 'No' ? validOption : undefined;
              })(),
            },
          },
          responses: {
            surveys: surveysByType,
            comparisons: comparisonsData || [],
          },
          completed_sessions: (surveysData?.length || 0) + (comparisonsData?.length || 0),
          createdAt: testDataWithCompetitors.created_at,
          updatedAt: testDataWithCompetitors.created_at,
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

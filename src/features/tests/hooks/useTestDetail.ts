import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Test } from '../../../types';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks/useAuth';
import { getCompletedSessionsCount } from '../services/sessionMetrics';

type TestResponse = {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'complete' | 'incomplete';
  search_term: string;
  objective?: string;
  skin?: 'amazon' | 'walmart' | 'tiktokshop';
  created_at: string;
  updated_at: string;
  company?: { name: string };
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

        // First, get user's profile to check company and role
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id, role')
          .eq('id', userId as any)
          .single();

        if (profileError || !userProfile) {
          throw new Error('Error fetching user profile');
        }

        // Check access permissions before fetching data
        const typedUserProfile = userProfile as { company_id: string; role: string };
        const isAdmin = typedUserProfile.role === 'admin';
        const userCompanyId = typedUserProfile.company_id;

        // Build query with access control at query-time
        let query = supabase
          .from('tests')
          .select(`
            id,
            name,
            status,
            search_term,
            objective,
            skin,
            created_at,
            company_id,
            company:companies(name),
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
          .eq('id', id as any);

        // For non-admin users, filter by company_id at query-time
        if (!isAdmin) {
          query = query.eq('company_id', userCompanyId as any);
        }

        const { data: testData, error: testError } = await query.single();

        if (testError) {
          console.error('Error fetching test:', testError);
          // Always return generic "test not found" for security
          // This prevents attackers from knowing if a test exists or if they lack permission
          throw new Error('Test not found');
        }

        if (!testData) {
          throw new Error('Test not found');
        }

        // Defense-in-depth: Additional check after fetch (should not be needed with proper RLS)
        // Return generic error to prevent information disclosure
        if (!isAdmin && (testData as any).company_id !== userCompanyId) {
          throw new Error('Test not found');
        }

        const typedTestData = testData as unknown as TestResponse;

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

        // Fetch competitor products based on available IDs and skin
        let competitors: any[] = [];
        if (competitorsData && competitorsData.length > 0) {
          const competitorPromises = competitorsData.map(async (comp: any) => {
            let product = null;
            
            // Fetch products based on the test's skin
            if (typedTestData.skin === 'walmart') {
              // For Walmart tests, only fetch from walmart_products
              const { data: walmartProduct } = await supabase
                .from('walmart_products')
                .select('id, title, image_url, price')
                .eq('id', comp.product_id)
                .single();
              
              if (walmartProduct) {
                product = walmartProduct;
              }
            } else {
              // For Amazon tests (default), only fetch from amazon_products
              const { data: amazonProduct } = await supabase
                .from('amazon_products')
                .select('id, title, image_url, price')
                .eq('id', comp.product_id)
                .single();
              
              if (amazonProduct) {
                product = amazonProduct;
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
          .eq('test_id', id as any);

        if (surveysError) throw surveysError;

        // Separate surveys by variation_type and map product data
        // Ensure required keys exist regardless of data presence
        const surveysInitial = { a: [], b: [], c: [] } as Record<'a' | 'b' | 'c', any[]>;
        
        const surveysByType = (surveysData || []).reduce((acc, item: any) => {
          const type = String(item?.tester_id?.variation_type ?? '').toLowerCase();
          if (type === 'a' || type === 'b' || type === 'c') {
            // Map the product_id to the actual product data from test_variations
            const productData = typedTestData.variations?.find(v => v.product.id === item.product_id)?.product;
            
            // Create the item with the correct product data
            const mappedItem = {
              ...item,
              ...(productData && { products: productData }),
            };
            
            acc[type].push(mappedItem);
          }
          return acc;
        }, surveysInitial);

        // Fetch comparison responses for the test
        // Use the appropriate table based on test skin
        const comparisonTable = typedTestData.skin === 'walmart' ? 'responses_comparisons_walmart' : 'responses_comparisons';
        
        const { data: comparisonsData, error: comparisonsError } = await supabase
          .from(comparisonTable)
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
          .eq('test_id', id as any);

        if (comparisonsError) throw comparisonsError;

        // Fetch test product selections from testers_session
        // These are users who selected the test product (not a competitor)
        const { data: testProductSessions, error: testProductSessionsError } = await supabase
          .from('testers_session')
          .select(`
            id,
            variation_type,
            product_id,
            prolific_pid,
            shopper_demographic(id_prolific, age, sex, country_residence)
          `)
          .eq('test_id', id as any)
          .not('product_id', 'is', null)
          .is('competitor_id', null)
          .is('walmart_product_id', null);

        if (testProductSessionsError) throw testProductSessionsError;

        // Build test product variations map
        const testProductByVariant = new Map<string, any>();
        (typedTestData.variations ?? []).forEach((v: any) => {
          const variant = String(v.variation_type || '').toLowerCase();
          if ((variant === 'a' || variant === 'b' || variant === 'c') && v.product) {
            testProductByVariant.set(variant, v.product);
          }
        });

        // Separate comparisons by variation_type and map competitor data
        // Build competitor map once for efficiency
        const competitorMap = new Map<string, any>(
          (testDataWithCompetitors.competitors ?? []).map((c: any) => [c.product.id, c.product])
        );

        // Ensure required keys exist regardless of data presence
        const initial = { a: [], b: [], c: [] } as Record<'a' | 'b' | 'c', any[]>;

        // First, add all competitor comparison responses
        const comparisonsByType = (comparisonsData ?? []).reduce((acc, item: any) => {
          const type = String(item?.tester_id?.variation_type ?? '').toLowerCase();
          if (type === 'a' || type === 'b' || type === 'c') {
            if (item.competitor_id) {
              // This is a competitor buyer
              const competitorData = competitorMap.get(item.competitor_id);
              acc[type].push({
                ...item,
                ...(competitorData && { 
                  // Use the appropriate product key based on test skin
                  [typedTestData.skin === 'walmart' ? 'walmart_products' : 'amazon_products']: competitorData
                }),
              });
            }
          }
          return acc;
        }, initial);

        // Now add test product buyers as synthetic comparison entries at the TOP
        // These users don't have responses_comparisons entries, so we create them from testers_session
        // Use unshift to add them at the beginning (top of the list)
        // Note: These have null comment fields - they're meant for display in a separate "buyers without comments" section
        (testProductSessions ?? []).forEach((session: any) => {
          const type = String(session.variation_type || '').toLowerCase();
          if (type === 'a' || type === 'b' || type === 'c') {
            const testProductData = testProductByVariant.get(type);
            
            // Create a synthetic comparison entry for test product buyers
            // These will be filtered out in ShopperComments if surveys exist
            comparisonsByType[type].unshift({
              competitor_id: null,
              product_id: session.product_id,
              choose_reason: null, // No comments - for display only
              improve_suggestions: null,
              likes_most: null,
              isTestProductBuyer: true, // Flag to identify these synthetic entries
              tester_id: {
                id: session.id,
                variation_type: session.variation_type,
                prolific_pid: session.prolific_pid,
                shopper_demographic: session.shopper_demographic || null,
              },
              ...(testProductData && { 
                // Use the appropriate product key based on test skin
                [typedTestData.skin === 'walmart' ? 'walmart_products' : 'amazon_products']: testProductData,
                products: testProductData // Also set products for compatibility
              }),
            });
          }
        });

        // Transform the data to match our Test type
        const transformedTest: Test = {
          id: testDataWithCompetitors.id,
          name: testDataWithCompetitors.name,
          status: testDataWithCompetitors.status as 'draft' | 'active' | 'complete' | 'incomplete',
          searchTerm: testDataWithCompetitors.search_term,
          objective: testDataWithCompetitors.objective,
          skin: testDataWithCompetitors.skin || 'amazon',
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
            comparisons: comparisonsByType,
          },
          completed_sessions: await getCompletedSessionsCount(testDataWithCompetitors.id),
          createdAt: testDataWithCompetitors.created_at,
          updatedAt: testDataWithCompetitors.created_at,
          companyName: testDataWithCompetitors.company?.name || undefined,
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

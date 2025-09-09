import { supabase } from '../../../lib/supabase';
import { TestData } from '../types';

export const checkAndFetchExistingSession = async (id: string, variant: string) => {
  if (!id) {
    return null;
  }
  
  const existingSessionId = localStorage.getItem('testerSessionId');
  const testId = id;
  const variationType = variant;


  if (existingSessionId && testId) {
    try {
      // First try to find the session by ID only
      const { data: sessionById, error: idError } = await supabase
        .from('testers_session')
        .select('*')
        .eq('id', existingSessionId)
        .single();

      if (idError) {
        if (idError.code === 'PGRST116') {
        } else {
          console.error('Unexpected error fetching session:', idError);
        }
        localStorage.removeItem('testerSessionId');
        return null;
      }

      // If session exists, check if it matches the current test
      if (sessionById) {
        
        if (sessionById.test_id === testId && sessionById.variation_type === variationType) {
          return sessionById;
        } else {
          localStorage.removeItem('testerSessionId');
          return null;
        }
      }
    } catch (error) {
      console.error('Error in checkAndFetchExistingSession:', error);
      localStorage.removeItem('testerSessionId');
      return null;
    }
  }
  
  // If no existing session found, return null to trigger session creation
  return null;
};
export const createNewSession = async (
  testIdraw: string,
  combinedData: any,
  prolificPid?: string | null
) => {
  const result = processString(testIdraw);
  const testId = result?.modifiedString ? result?.modifiedString : '';
  const variationType = result?.lastCharacter ? result?.lastCharacter : '';
  try {
    // Primero verificar si existe un registro en shopper_demographic
    if (!prolificPid) {
      console.error('No prolific_pid provided');
      return null;
    }

    const { data: demographicData, error: demographicError } = await supabase
      .from('shopper_demographic')
      .select('*')
      .eq('id_prolific', prolificPid)
      .single();

    if (demographicError && demographicError.code !== 'PGRST116') {
      // PGRST116 es el código para "no se encontraron filas"
      console.error('Error checking shopper demographic:', demographicError);
      return null;
    }

    // Si no existe el registro demográfico, crearlo
    if (!demographicData) {
      const { error: insertError } = await supabase.from('shopper_demographic').insert([
        {
          id_prolific: prolificPid,
          country_residence: 'No set',
          nationality: 'No set',
        } as any,
      ]);

      if (insertError) {
        console.error('Error creating demographic record:', insertError);
        return null;
      }
    }

    // Crear la sesión
    const { data, error } = await supabase
      .from('testers_session')
      .insert([
        {
          test_id: testId,
          status: 'started',
          variation_type: variationType,
          prolific_pid: prolificPid || null,
        } as any,
      ])
      .select('id');

    if (error) {
      console.error('Error saving to the database:', error);
      return null;
    } else if (data && data.length > 0 && combinedData) {
      const sessionId = data[0].id;
      localStorage.setItem('testerSessionId', sessionId);
      return sessionId;
    }
  } catch (error) {
    console.error('Error attempting to save to the database:', error);
  }
  return null;
};

interface CombinedData {
  sessionId: any;
  id: string;
  asin: string;
  walmart_id?: string; // Optional field for Walmart products
}

export const updateSession = async (
  combinedData: CombinedData,
  sessionId: any
): Promise<string | null> => {
  if (!combinedData || !sessionId) {
    console.error('Invalid parameters: testId or combinedData is missing');
    return null;
  }
  
  // Check if this is a Walmart product by looking for walmart_id
  const isWalmartProduct = combinedData.walmart_id;
  // For Amazon products, check if it has asin (which indicates it's from amazon_products table)
  const isAmazonProduct = combinedData.asin;
  // Determine if it's a competitor based on the product type
  const isCompetitor = isAmazonProduct ? combinedData.asin : false;
  
  // For Walmart products, we need to handle them differently since they don't exist in the products table
  if (isWalmartProduct) {
    try {
      // For Walmart products, use walmart_product_id column to avoid foreign key constraints
      const updateObject: any = { 
        status: 'questions',
        walmart_product_id: combinedData.id, // Store Walmart product ID in walmart_product_id column
        competitor_id: null, // Clear competitor_id for Walmart products
        product_id: null // Clear product_id for Walmart products
      };

      const { error } = await supabase
        .from('testers_session')
        .update(updateObject)
        .eq('id', sessionId)
        .select('id');

      if (error) {
        console.error('Error updating session for Walmart product:', error);
        return null;
      }
      
      return sessionId;
    } catch (error) {
      console.error('Unexpected error while updating session for Walmart product:', error);
      return null;
    }
  }
  
  // Handle Amazon products as before
  const column = isCompetitor ? 'competitor_id' : 'product_id';

  try {
    // Fetch the current session to check existing competitor_id or product_id
    const { data: existingData, error: fetchError } = await supabase
      .from('testers_session')
      .select('competitor_id, product_id')
      .eq('id', sessionId)
      .single();

    if (fetchError) {
      console.error('Error fetching current session data:', fetchError);
      return null;
    }

    // Prepare the update object to clear existing IDs
    const updateObject: any = { status: 'questions', [column]: combinedData.id };
    if (existingData) {
      if (existingData.competitor_id) updateObject.competitor_id = null;
      if (existingData.product_id) updateObject.product_id = null;
    }

    // Update the session
    const { error } = await supabase
      .from('testers_session')
      .update(updateObject)
      .eq('id', sessionId)
      .select('id');

    if (error) {
      console.error('Error updating session in the database:', error);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error while updating session:', error);
  }

  return null;
};

export async function recordTimeSpent(
  testId: string,
  itemId: string,
  startTime: number,
  endTime: number,
  isCompetitor: boolean = false,
  isWalmartExperience: boolean = false
): Promise<void> {
  const timeSpent = Math.floor(endTime - startTime);
  
  try {
    let column: 'competitor_id' | 'product_id' | 'walmart_product_id';
    
    if (isWalmartExperience) {
      // In Walmart experience, verify the product exists before tracking
      try {
        const { data: walmartProduct, error: walmartError } = await supabase
          .from('walmart_products')
          .select('id')
          .eq('id', itemId)
          .single();
        
        if (walmartProduct && !walmartError) {
          // Product exists, use walmart_product_id column
          column = 'walmart_product_id';
        } else {
          // Product doesn't exist in walmart_products, skip tracking
          console.warn(`Walmart product ${itemId} not found in database, skipping time tracking`);
          return;
        }
      } catch (error) {
        // Product lookup failed, skip tracking
        console.warn(`Failed to verify Walmart product ${itemId}, skipping time tracking:`, error);
        return;
      }
      } else {
        try {

          const { data: amazonProduct, error: amazonError } = await supabase
            .from('amazon_products')
            .select('id, asin')
            .eq('id', itemId)
            .single();
             
          if (amazonProduct && !amazonError) {
            // This is an Amazon product, use the original logic
            column = isCompetitor ? 'competitor_id' : 'product_id';
          } else {
            // Check if it's a Walmart product
            const { data: walmartProduct, error: walmartError } = await supabase
              .from('walmart_products')
              .select('id, walmart_id')
              .eq('id', itemId)
              .single();
                     
            if (walmartProduct && !walmartError) {
              column = 'walmart_product_id';
            } else {
              console.warn(`❌ Product ${itemId} not found in amazon_products or walmart_products, skipping time tracking`);
              return;
            }
          }
        } catch (error) {
          column = isCompetitor ? 'competitor_id' : 'product_id';
        }
      }

    // Check if the record already exists
    const { data: existingRecords, error: fetchError } = await supabase
      .from('test_times')
      .select('id, time_spent')
      .eq('testers_session', testId)
      .eq(column, itemId);

    if (fetchError) {
      console.error('Error fetching existing time records:', fetchError);
      throw fetchError;
    }

    const existingData = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;

    if (existingData) {
      // Update the existing record
      const newTimeSpent = existingData.time_spent + timeSpent / 1000;
      const { error: updateError } = await supabase
        .from('test_times')
        .update({ time_spent: newTimeSpent })
        .eq('id', existingData.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Insert a new record
      const insertData: any = { 
        testers_session: testId, 
        time_spent: timeSpent / 1000 
      };
      insertData[column] = itemId;

      const { data, error: insertError } = await supabase
        .from('test_times')
        .insert([insertData]);

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error processing time spent:', error);
  }
}

export const processString = (input: string) => {
  if (input.length < 2) {
    console.error('Input string is too short.');
    return null;
  }
  // Cut the last two characters
  const modifiedString = input.slice(0, -2);
  // Store the last character
  const lastCharacter = input.slice(-1);
  return { modifiedString, lastCharacter };
};

export const fetchProductAndCompetitorData = async (id: string): Promise<TestData | null> => {
  const result = processString(id);
  const variationType = result?.lastCharacter ? result?.lastCharacter : '';
  const testId = result?.modifiedString ? result?.modifiedString : '';

  try {
    // Fetch test data without complex joins
    const { data, error } = await supabase
      .from('tests')
      .select(
        `
                *,
                variations:test_variations(
                  product:products(
                    *,
                    company:companies(name)
                  ),
                  variation_type
                )
            `
      )
      .eq('id', testId)
      .eq('variations.variation_type', variationType)
      .single();

    if (error) throw new Error(`Error fetching test data: ${error.message}`);
    if (!data || !('variations' in data)) {
      throw new Error('No variations found');
    }

    // Fetch competitors separately to avoid join issues
    const { data: competitorsData, error: competitorsError } = await supabase
      .from('test_competitors')
      .select(`
        id,
        product_id,
        product_type
      `)
      .eq('test_id', testId);

    if (competitorsError) {
      console.error('Error fetching competitors:', competitorsError);
    }

    // Fetch competitor products based on product_type
    let competitors = [];
    console.log('🔍 fetchProductAndCompetitorData: competitorsData:', competitorsData);
    console.log('🔍 fetchProductAndCompetitorData: competitorsData.length:', competitorsData?.length);
    
    if (competitorsData && competitorsData.length > 0) {
      const competitorPromises = competitorsData.map(async (comp) => {
        if (comp.product_id) {
          if (comp.product_type === 'walmart_product') {
            // For Walmart products, fetch from walmart_products
            const product = await supabase
              .from('walmart_products')
              .select('*')
              .eq('id', comp.product_id)
              .maybeSingle();
            
            if (product.data) {
              console.log('🔍 Found Walmart product:', product.data.title, 'ID:', comp.product_id);
              return product.data;
            } else {
              console.warn(`Walmart product not found for ID: ${comp.product_id}`);
            }
          } else if (comp.product_type === 'amazon_product') {
            // For Amazon products, fetch from amazon_products
            const product = await supabase
              .from('amazon_products')
              .select('*')
              .eq('id', comp.product_id)
              .maybeSingle();
            
            if (product.data) {
              return product.data;
            } else {
              console.warn(`Amazon product not found for ID: ${comp.product_id}`);
            }
          } else {
            console.warn(`Unknown product type: ${comp.product_type} for product ID: ${comp.product_id}`);
          }
        }
        return null;
      });

      const competitorResults = await Promise.all(competitorPromises);
      competitors = competitorResults.filter(Boolean);
      console.log('🔍 fetchProductAndCompetitorData: Final competitors count:', competitors.length);
      console.log('🔍 fetchProductAndCompetitorData: Final competitors:', competitors);
    } else {
      console.log('🔍 fetchProductAndCompetitorData: No competitors data found');
    }

    // Variations should always be included - they are the main product being tested
    // For Walmart tests, check if variation exists in walmart_products table
    let filteredVariations = data.variations;
    
    if (data.skin === 'walmart') {
      // For Walmart tests, try to find the variation in walmart_products table
      const variationPromises = filteredVariations.map(async (variation: any) => {
        if (variation.product && variation.product.id) {
          // Check if the product exists in walmart_products
          const { data: walmartProduct } = await supabase
            .from('walmart_products')
            .select('*')
            .eq('id', variation.product.id)
            .maybeSingle();
          
          if (walmartProduct) {
            // Use the Walmart product data
            return {
              ...variation,
              product: walmartProduct
            };
          } else {
            // Keep the original product data but add walmart_id if missing
            console.warn(`Variation product ${variation.product.id} not found in walmart_products, using generic product data`);
            return {
              ...variation,
              product: {
                ...variation.product,
                walmart_id: variation.product.walmart_id || variation.product.id // Use product ID as fallback
              }
            };
          }
        }
        return variation;
      });
      
      filteredVariations = await Promise.all(variationPromises);
    }

    const sessionData = filteredVariations.map((session: any) => {
      if (session.product && session.product.company?.name) {
        session.product.brand = session.product.company.name;
        delete session.product.company;
      }
      return session;
    });

    // Add company information to competitors if they have company_id
    const competitorsWithCompany = await Promise.all(competitors.map(async (competitor: any) => {
      if (competitor.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', competitor.company_id)
          .single();
        
        if (company) {
          competitor.brand = company.name;
        }
      }
      return competitor;
    }));

    const result = { ...data, variations: sessionData, competitors: competitorsWithCompany } as unknown as TestData;
    console.log('🔍 fetchProductAndCompetitorData: Final result competitors count:', result.competitors?.length);
    console.log('🔍 fetchProductAndCompetitorData: Final result competitors:', result.competitors);
    return result;
  } catch (error) {
    console.error('Error fetching test data:', error);
    return null;
  }
};

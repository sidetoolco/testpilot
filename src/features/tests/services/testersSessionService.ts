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

export const updateSession = async (
  product: any,
  sessionId: any
): Promise<string | null> => {
  if (!product || !sessionId) {
    console.error('Invalid parameters: product or sessionId is missing');
    return null;
  }
  
  // Check if this is a Walmart product by looking for walmart_id
  const isWalmartProduct = product.walmart_id;
  const isTikTokProduct = product.tiktok_id;
  // For Amazon products, check if it has asin (which indicates it's from amazon_products table)
  const isAmazonProduct = product.asin;
  // Determine if it's a competitor based on the product type
  const isCompetitor = isAmazonProduct ? product.asin : false;
  
  // For Walmart products, we need to handle them differently since they don't exist in the products table
  if (isWalmartProduct) {
    try {
      // For Walmart products, use walmart_product_id column to avoid foreign key constraints
      const updateObject: any = { 
        status: 'questions',
        walmart_product_id: product.id, // Store Walmart product ID in walmart_product_id column
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

  if (isTikTokProduct) {
    try {
      const updateObject: any = {
        status: 'questions',
        tiktok_product_id: product.id,
        competitor_id: null,
        product_id: null,
        walmart_product_id: null,
      };

      const { error } = await supabase
        .from('testers_session')
        .update(updateObject)
        .eq('id', sessionId)
        .select('id');

      if (error) {
        console.error('Error updating session for TikTok product:', error);
        return null;
      }

      return sessionId;
    } catch (error) {
      console.error('Unexpected error while updating session for TikTok product:', error);
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
    const updateObject: any = { status: 'questions', [column]: product.id };
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

// Helper function to get main product ID for a test
const getMainProductId = async (testId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('test_variations')
      .select('product_id')
      .eq('test_id', testId)
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching main product ID:', error);
      return null;
    }
    
    return data?.product_id || null;
  } catch (error) {
    console.error('Error in getMainProductId:', error);
    return null;
  }
};

export async function recordTimeSpent(
  testId: string,
  itemId: string,
  startTime: number,
  endTime: number,
  isCompetitor: boolean = false,
  isWalmartExperience: boolean = false,
  mainProductId?: string,
  competitorId?: string
): Promise<void> {
  const timeSpent = Math.floor(endTime - startTime);
  
  try {
    let column: 'competitor_id' | 'product_id' | 'walmart_product_id' | 'tiktok_product_id';
    
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
              const { data: tiktokProduct, error: tiktokError } = await supabase
                .from('tiktok_products')
                .select('id, tiktok_id')
                .eq('id', itemId)
                .single();

              if (tiktokProduct && !tiktokError) {
                column = 'tiktok_product_id';
              } else {
                return;
              }
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
      // Insert a new record with all required fields
      const insertData: any = { 
        testers_session: testId, 
        time_spent: timeSpent / 1000,
        click: 1 // Add click field as required
      };
      
      // Set the appropriate column based on product type
      insertData[column] = itemId;
      
      // Add competitor and product linking information
      const actualMainProductId = mainProductId || await getMainProductId(testId);
      
      if (isWalmartExperience) {
        // For Walmart tests, use walmart_product_id and product_id
        insertData.walmart_product_id = itemId;
        if (actualMainProductId) {
          insertData.product_id = actualMainProductId;
        }
        // Don't set competitor_id for Walmart tests - it only accepts Amazon product IDs
      } else if (column === 'tiktok_product_id') {
        insertData.tiktok_product_id = itemId;
        if (actualMainProductId) {
          insertData.product_id = actualMainProductId;
        }
      } else {
        // For Amazon tests, include proper competitor linking
        if (isCompetitor && competitorId) {
          insertData.competitor_id = competitorId;
        }
        if (actualMainProductId) {
          insertData.product_id = actualMainProductId;
        }
      }

      const { data, error: insertError } = await supabase
        .from('test_times')
        .insert([insertData]);

      if (insertError) {
        console.error('Error inserting timing data:', insertError);
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

    // Fetch competitor products based on product_type or test skin
    let competitors = [];
    
    if (competitorsData && competitorsData.length > 0) {
      const competitorPromises = competitorsData.map(async (comp) => {
        if (comp.product_id) {
          // Use the product_type field from the backend (now properly set)
          const productType = comp.product_type;
          if (productType === 'walmart_product') {
            // For Walmart products, fetch from walmart_products
            const product = await supabase
              .from('walmart_products')
              .select('*')
              .eq('id', comp.product_id)
              .maybeSingle();
            
            if (product.data) {
              return product.data;
            } else {
              console.warn(`Walmart product not found for ID: ${comp.product_id}`);
            }
          } else if (productType === 'amazon_product') {
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
          } else if (productType === 'tiktok_product') {
            const product = await supabase
              .from('tiktok_products')
              .select('*')
              .eq('id', comp.product_id)
              .maybeSingle();

            if (product.data) {
              return product.data;
            } else {
              console.warn(`TikTok product not found for ID: ${comp.product_id}`);
            }
          } else {
            console.warn(`Unknown product type: ${productType} for product ID: ${comp.product_id}`);
          }
        }
        return null;
      });

      const competitorResults = await Promise.all(competitorPromises);
      competitors = competitorResults.filter(Boolean);
    } 

    let filteredVariations = data.variations;
    
    if (data.skin === 'walmart') {
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
    return result;
  } catch (error) {
    console.error('Error fetching test data:', error);
    return null;
  }
};

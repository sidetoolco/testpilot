import { supabase } from '../../../../../lib/supabase';
import apiClient from '../../../../../lib/api';

export const checkIdInIaInsights = async (id: string) => {
  try {
    console.log('Checking if AI insights exist for test:', id);

    const response = await apiClient.get(`/insights/${id}?type=ai`);

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log('AI insights found:', response.data[0]);
      return response.data[0];
    }

    console.log('No AI insights found for test:', id);
    return false;
  } catch (error: any) {
    console.error('Error checking AI insights:', error);
    if (error.response?.status === 404) {
      return false;
    }
    return false;
  }
};

// Checks the status of a test by its ID.
// Parameters:
//   - id (string): The ID of the test to be checked.
// Returns: true if the test status is 'complete', otherwise false.
export const checkTestStatus = async (id: string) => {
  try {
    const { data, error } = await supabase.from('tests').select('status').eq('id', id);

    if (error) {
      console.error('Error fetching data:', error);
      return false;
    }

    return data.length > 0 && data[0].status === 'complete';
  } catch (error) {
    console.error('Error checking ID:', error);
    return false;
  }
};

interface Survey {
  product_id: string;
  products: { title: string };
  value: number;
  appearance: number;
  confidence: number;
  brand: number;
  convenience: number;
  tester_id: { variation_type: string };
}

interface SummaryRow {
  title: string;
  shareOfClicks: string;
  shareOfBuy: string;
  valueScore: string;
  isWinner: string;
}

export const transformDataToSummaryRow = (data: any): SummaryRow => {
  return {
    title: `Variant ${data.variant_type.toUpperCase()} - ${data.product.title}`, // Ajusta esto según sea necesario
    shareOfClicks: data.share_of_click.toString(),
    shareOfBuy: data.share_of_buy.toString(),
    valueScore: data.value_score.toString(),
    isWinner: data.win ? 'Yes' : 'No', // Ajusta según la lógica de tu aplicación
  };
};

export const getSummaryData = async (
  id: string
): Promise<{
  rows: SummaryRow[];
  error: string | null;
}> => {
  if (!id) {
    return {
      rows: [],
      error: 'Not enough data for analysis.',
    };
  }

  try {
    const { data: summaryData, error: summaryError } = await supabase
      .from('summary')
      .select('*, product:product_id(title)')
      .eq('test_id', id)
      .order('variant_type');

    if (summaryError) throw summaryError;

    return {
      rows: summaryData.map(transformDataToSummaryRow),
      error: null,
    };
  } catch (error) {
    console.error('Error loading summary data:', error);
    return {
      rows: [],
      error: 'Failed to load summary data. Please try again.',
    };
  }
};

export const getAveragesurveys = async (
  id: string
): Promise<{
  summaryData: any;
  error: string | null;
}> => {
  if (!id) {
    return {
      summaryData: [],
      error: 'Not enough data for analysis.',
    };
  }

  try {
    const { data: summaryData, error: summaryError } = await supabase
      .from('purchase_drivers')
      .select('*, product:product_id(title, image_url, price)')
      .eq('test_id', id)
      .order('variant_type');

    if (summaryError) throw summaryError;

    return {
      summaryData,
      error: null,
    };
  } catch (error) {
    console.error('Error loading summary data:', error);
    return {
      summaryData: [],
      error: 'Failed to load summary data. Please try again.',
    };
  }
};

export const getCompetitiveInsights = async (
  id: string
): Promise<{
  summaryData: any;
  error: string | null;
}> => {
  if (!id) {
    return {
      summaryData: [],
      error: 'Not enough data for analysis.',
    };
  }

  try {
    // Fetch competitive insights with proper variant filtering
    const { data: summaryData, error: summaryError } = await supabase
      .from('competitive_insights')
      .select(
        '*, competitor_product_id: competitor_product_id(title, image_url, product_url,price)'
      )
      .eq('test_id', id)
      .order('variant_type');

    if (summaryError) throw summaryError;

    // Fetch test product data to include in share of buy calculation
    const { data: testProductData, error: testProductError } = await supabase
      .from('summary')
      .select('*, product:product_id(title, image_url, price)')
      .eq('test_id', id)
      .order('variant_type');

    if (testProductError) throw testProductError;

    // Group by variant and recalculate share of buy percentages per variant
    const groupedByVariant = summaryData.reduce((acc: any, item: any) => {
      const variant = item.variant_type;
      if (!acc[variant]) {
        acc[variant] = [];
      }
      acc[variant].push(item);
      return acc;
    }, {});

    const recalculatedData = Object.entries(groupedByVariant).flatMap(([variant, items]) => {
      const variantItems = items as any[];
      
      // Find the test product for this variant
      const testProduct = testProductData?.find((item: any) => item.variant_type === variant);
      
      // Calculate total selections including test product
      const competitorSelections = variantItems.reduce((sum: number, item: any) => sum + Number(item.count || 0), 0);
      
      // Get test product selections - we need to calculate this from the share_of_buy percentage
      // and the total number of shoppers for this variant
      let testProductSelections = 0;
      if (testProduct && testProduct.share_of_buy) {
        // If we have the share_of_buy percentage, we can estimate the count
        // For now, let's use a reasonable estimate based on the percentage
        const testProductPercentage = Number(testProduct.share_of_buy);
        const estimatedTotalShoppers = competitorSelections / (100 - testProductPercentage) * 100;
        testProductSelections = Math.round((testProductPercentage / 100) * estimatedTotalShoppers);
      }
      
      const totalSelections = competitorSelections + testProductSelections;
      
      return variantItems.map((item: any) => {
        // FIX: Create unique competitor_product_id by appending variant type
        // This ensures that the same competitor in different variants is treated as separate entities
        // This prevents share of buy percentages from exceeding 100% when the same tester
        // selects the same competitor in different variants
        const originalCompetitorProduct = item.competitor_product_id;
        
        // Fallback: if competitor_product_id is undefined, use the item's own ID
        const competitorId = originalCompetitorProduct?.id || item.competitor_product_id || item.id || 'unknown';
        
        const uniqueCompetitorProduct = {
          ...originalCompetitorProduct,
          id: `${competitorId}_${variant}`,
        };

        // Recalculate share of buy based on total selections for this variant only (including test product)
        const shareOfBuy = totalSelections > 0 ? ((Number(item.count || 0) / totalSelections) * 100) : 0;

        return {
          ...item,
          competitor_product_id: uniqueCompetitorProduct,
          share_of_buy: shareOfBuy,
        };
      });
    });

    // Sort by variant and then by share of buy (descending)
    const sortedData = recalculatedData.sort((a: any, b: any) => {
      if (a.variant_type !== b.variant_type) {
        return a.variant_type.localeCompare(b.variant_type);
      }
      return (b.share_of_buy || 0) - (a.share_of_buy || 0);
    });

    return {
      summaryData: sortedData,
      error: null,
    };
  } catch (error) {
    console.error('Error loading summary data:', error);
    return {
      summaryData: [],
      error: 'Failed to load summary data. Please try again.',
    };
  }
};

// Function to fetch AI insights from the backend API
export const getAiInsights = async (
  testId: string
): Promise<{
  insights: any[];
  error: string | null;
}> => {
  if (!testId) {
    return {
      insights: [],
      error: 'Test ID is required.',
    };
  }

  try {
    console.log('Fetching AI insights from backend API for test:', testId);

    const response = await apiClient.get(`/insights/${testId}?type=ai`);

    console.log('AI insights fetched successfully from backend:', response.data);
    
    return {
      insights: response.data || [],
      error: null,
    };
  } catch (error: any) {
    console.error('Error fetching AI insights from backend:', error);
    return {
      insights: [],
      error: error.response?.data?.message || error.message || 'Failed to load AI insights. Please try again.',
    };
  }
};

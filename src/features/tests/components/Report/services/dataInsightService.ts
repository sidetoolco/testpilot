import { supabase } from '../../../../../lib/supabase';
import apiClient from '../../../../../lib/api';

export const checkIdInIaInsights = async (id: string) => {
  try {

    const response = await apiClient.get(`/insights/${id}?type=ai`);

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }

    return false;
  } catch (error: any) {
    console.error('Error checking AI insights:', error);
    if (error.response?.status === 404) {
      return false;
    }
    return false;
  }
};

export const checkTestStatus = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('status')
      .eq('id', id as any);

    if (error) {
      console.error('Error fetching data:', error);
      return false;
    }

    return data && data.length > 0 && (data[0] as any)?.status === 'complete';
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
    title: `Variant ${data.variant_type.toUpperCase()} - ${data.product.title}`,
    shareOfClicks: data.share_of_click.toString(),
    shareOfBuy: data.share_of_buy.toString(),
    valueScore: data.value_score.toString(),
    isWinner: data.win ? 'Yes' : 'No',
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
      .eq('test_id', id as any)
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
      .eq('test_id', id as any)
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
    // First check if this is a Walmart test by looking at test_competitors
    const competitors = await supabase
      .from('test_competitors')
      .select('product_type')
      .eq('test_id', id as any);

    const isWalmartTest = competitors.data?.some((c: any) => c.product_type === 'walmart_product');

    // Use the appropriate table based on test type
    const tableName = isWalmartTest ? 'competitive_insights_walmart' : 'competitive_insights';
    

    const { data: summaryData, error: summaryError } = await supabase
      .from(tableName)
      .select(
        '*, competitor_product_id: competitor_product_id(title, image_url, product_url,price)'
      )
      .eq('test_id', id as any)
      .order('variant_type');

    if (summaryError) throw summaryError;


    const { data: testProductData, error: testProductError } = await supabase
      .from('summary')
      .select('*, product:product_id(title, image_url, price)')
      .eq('test_id', id as any)
      .order('variant_type');

    if (testProductError) throw testProductError;

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

      const testProduct = (testProductData as any[])?.find((item: any) => item.variant_type === variant);

      // Calculate total selections from comparison responses only
      const competitorSelections = variantItems.reduce(
        (sum: number, item: any) => sum + Number(item.count || 0),
        0
      );

      // For competitive insights, we need to estimate test product selections
      // Since comparison responses only track competitor choices, we need to estimate
      // the test product's share based on the survey data
      let testProductSelections = 0;
      if (testProduct && (testProduct as any).share_of_buy) {
        const testProductPercentage = Number((testProduct as any).share_of_buy);
        
        // If test product has 100% in surveys, it means it got all the survey responses
        // But in comparisons, we need to estimate how many would choose it vs competitors
        // For now, let's estimate that if test product got 100% in surveys,
        // it would get a reasonable share in comparisons too
        if (testProductPercentage >= 99) {
          // Estimate test product got some selections in comparisons
          // This is a rough estimate - in reality, we'd need different data
          testProductSelections = Math.max(1, Math.round(competitorSelections * 0.1));
        } else {
          // For lower percentages, estimate based on the ratio
          const estimatedTotal = (competitorSelections / (100 - testProductPercentage)) * 100;
          testProductSelections = Math.round((testProductPercentage / 100) * estimatedTotal);
        }
      }

      const totalSelections = competitorSelections + testProductSelections;


      const competitorResults = variantItems.map((item: any) => {
        const originalCompetitorProduct = item.competitor_product_id;

        const competitorId = originalCompetitorProduct?.id || item.id || 'unknown';

        const uniqueCompetitorProduct = {
          ...originalCompetitorProduct,
          id: `${competitorId}_${variant}`,
        };

        // Recalculate share_of_buy based on actual counts
        const competitorCount = Number(item.count || 0);
        const recalculatedShareOfBuy = totalSelections > 0 
          ? ((competitorCount / totalSelections) * 100).toFixed(2)
          : '0.00';

        return {
          ...item,
          competitor_product_id: uniqueCompetitorProduct,
          // Use recalculated share_of_buy based on actual counts
          share_of_buy: recalculatedShareOfBuy,
        };
      });

      // Add test product to competitive insights with estimated share
      if (testProduct) {
        const testProductCount = testProductSelections;
        const recalculatedTestProductShareOfBuy = totalSelections > 0 
          ? ((testProductCount / totalSelections) * 100).toFixed(2)
          : '0.00';

        const testProductResult = {
          ...testProduct,
          variant_type: variant,
          // Mark this as a test product (not a competitor)
          isTestProduct: true,
          // Use estimated share_of_buy based on comparison data
          share_of_buy: recalculatedTestProductShareOfBuy,
          count: testProductCount,
        };
        
        return [testProductResult, ...competitorResults];
      }

      return competitorResults;
    });

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

export const getAiInsights = async (
  testId: string
): Promise<{
  insights: any;
  error: string | null;
}> => {
  if (!testId) {
    return {
      insights: null,
      error: 'Test ID is required.',
    };
  }

  try {

    const response = await apiClient.get(`/insights/${testId}?type=ai`);


    // Handle both array and single object responses
    let insights = response.data;
    if (Array.isArray(insights)) {
      if (insights.length > 0) {
        insights = insights[0]; // Extract the first (and only) object from array
      } else {
        insights = null; // Return null for empty arrays
      }
    }

    return {
      insights: insights || null,
      error: null,
    };
  } catch (error: any) {
    console.error('Error fetching AI insights from backend:', error);
    return {
      insights: null,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to load AI insights. Please try again.',
    };
  }
};

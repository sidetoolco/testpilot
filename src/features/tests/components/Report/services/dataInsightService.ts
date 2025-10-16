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
    // Get summary data from database
    const { data: summaryData, error: summaryError } = await supabase
      .from('summary')
      .select('*, product:product_id(title)')
      .eq('test_id', id as any)
      .order('variant_type');

    if (summaryError) throw summaryError;

    // Use testers_session as source of truth for selections (exclude unknown rows)
    const { data: sessions, error: sessionsError } = await supabase
      .from('testers_session')
      .select('variation_type, product_id, competitor_id, walmart_product_id')
      .eq('test_id', id as any);

    if (sessionsError) throw sessionsError;

    const selectionsByVariant: { [variant: string]: { testProduct: number; competitors: number; total: number } } = {};

    (sessions || []).forEach((row: any) => {
      try {
        const variant = String(row.variation_type || '').toLowerCase();
        if (variant === 'a' || variant === 'b' || variant === 'c') {
          if (!selectionsByVariant[variant]) {
            selectionsByVariant[variant] = { testProduct: 0, competitors: 0, total: 0 };
          }
          const isCompetitor = !!(row.competitor_id || row.walmart_product_id);
          const isTestProduct = !!row.product_id && !isCompetitor;

          if (isCompetitor) selectionsByVariant[variant].competitors++;
          if (isTestProduct) selectionsByVariant[variant].testProduct++;

          if (isCompetitor || isTestProduct) selectionsByVariant[variant].total++;
        }
      } catch (error) {
        console.error('Error processing session data row in getSummaryData:', error, row);
      }
    });

    // Align test-product selections with ShopperComments: use responses_surveys by variant via test_variations
    const { data: variations, error: variationsError } = await supabase
      .from('test_variations')
      .select('variation_type, product_id')
      .eq('test_id', id as any);

    if (variationsError) throw variationsError;

    const variantByProductId = new Map<string, string>();
    (variations || []).forEach((v: any) => {
      const variant = String(v.variation_type || '').toLowerCase();
      if (variant === 'a' || variant === 'b' || variant === 'c') {
        variantByProductId.set(String(v.product_id), variant);
        if (!selectionsByVariant[variant]) {
          selectionsByVariant[variant] = { testProduct: 0, competitors: 0, total: 0 };
        }
      }
    });

    const { data: surveys, error: surveysError } = await supabase
      .from('responses_surveys')
      .select('product_id')
      .eq('test_id', id as any);

    if (surveysError) throw surveysError;

    // Use surveys as fallback only when sessions had zero test picks for a variant
    (surveys || []).forEach((row: any) => {
      try {
        const variant = variantByProductId.get(String(row.product_id));
        if (!variant) {
          console.warn(`No variant found for product_id in getSummaryData: ${row.product_id}`);
          return;
        }
        if ((selectionsByVariant[variant]?.testProduct || 0) === 0) {
          selectionsByVariant[variant].testProduct = 1;
          selectionsByVariant[variant].total = (selectionsByVariant[variant].total || 0) + 1;
        }
      } catch (error) {
        console.error('Error processing survey data row in getSummaryData:', error, row);
      }
    });

    // Recalculate summary data with correct share_of_buy values
    const correctedSummaryData = summaryData.map((item: any) => {
      const variant = String(item.variant_type).toLowerCase();
      const selections = selectionsByVariant[variant] || { testProduct: 0, competitors: 0, total: 0 };
      
      // Calculate correct share_of_buy for the test product
      const correctShareOfBuy = selections.total > 0 
        ? ((selections.testProduct / selections.total) * 100).toFixed(1)
        : '0.0';

      return {
        ...item,
        share_of_buy: correctShareOfBuy,
      };
    });

    return {
      rows: correctedSummaryData.map(transformDataToSummaryRow),
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
    // Robust Walmart detection with parallel queries
    const [walmartInsightsResult, sessionProbeResult, compProbeResult] = await Promise.all([
      supabase
        .from('competitive_insights_walmart')
        .select('id')
        .eq('test_id', id as any)
        .limit(1),
      supabase
        .from('testers_session')
        .select('walmart_product_id')
        .eq('test_id', id as any)
        .limit(1),
      supabase
        .from('test_competitors')
        .select('product_type')
        .eq('test_id', id as any)
        .limit(1)
    ]);

    const isWalmartTest = !!(
      (walmartInsightsResult.data && walmartInsightsResult.data.length > 0) ||
      (sessionProbeResult.data && sessionProbeResult.data.some((r: any) => r.walmart_product_id)) ||
      (compProbeResult.data && compProbeResult.data.some((c: any) => c.product_type === 'walmart_product'))
    );

    // Use the appropriate table based on test type
    const tableName = isWalmartTest ? 'competitive_insights_walmart' : 'competitive_insights';
    
    const { data: summaryData, error: summaryError } = await supabase
      .from(tableName)
      .select(
        `*, competitor_product_id: competitor_product_id(id, title, image_url, product_url, price)`
      )
      .eq('test_id', id as any)
      .order('variant_type');

    if (summaryError) throw summaryError;

    // Use testers_session as source of truth for selections (same as summary)
    const { data: sessions, error: sessionsError } = await supabase
      .from('testers_session')
      .select('variation_type, product_id, competitor_id, walmart_product_id')
      .eq('test_id', id as any);

    if (sessionsError) throw sessionsError;

    // Calculate selections by variant using the same logic as summary
    const selectionsByVariant: { [variant: string]: { testProduct: number; competitors: number; total: number } } = {};

    (sessions || []).forEach((row: any) => {
      try {
        const variant = String(row.variation_type || '').toLowerCase();
        if (variant === 'a' || variant === 'b' || variant === 'c') {
          if (!selectionsByVariant[variant]) {
            selectionsByVariant[variant] = { testProduct: 0, competitors: 0, total: 0 };
          }
          const isCompetitor = !!(row.competitor_id || row.walmart_product_id);
          const isTestProduct = !!row.product_id && !isCompetitor;

          if (isCompetitor) selectionsByVariant[variant].competitors++;
          if (isTestProduct) selectionsByVariant[variant].testProduct++;

          if (isCompetitor || isTestProduct) selectionsByVariant[variant].total++;
        }
      } catch (error) {
        console.error('Error processing session data row in getCompetitiveInsights:', error, row);
      }
    });

    // Get test product data from summary table
    const { data: testProductData, error: testProductError } = await supabase
      .from('summary')
      .select('*, product:product_id(title, image_url, price)')
      .eq('test_id', id as any)
      .order('variant_type');

    if (testProductError) throw testProductError;

    // Group by variant
    const groupedByVariant = (summaryData || []).reduce((acc: any, item: any) => {
      const variant = item.variant_type;
      if (!acc[variant]) {
        acc[variant] = [];
      }
      acc[variant].push(item);
      return acc;
    }, {});

    const recalculatedData = Object.entries(groupedByVariant).flatMap(([variant, items]) => {
      const variantItems = items as any[];
      const normalizedVariant = String(variant).toLowerCase();
      const selections = selectionsByVariant[normalizedVariant] || { testProduct: 0, competitors: 0, total: 0 };

      const testProduct = (testProductData as any[])?.find((item: any) => String(item.variant_type).toLowerCase() === normalizedVariant);

      // Calculate competitor counts for this variant from sessions data
      const competitorCountsMap: { [competitorId: string]: number } = {};
      
      // Count competitors from sessions data
      (sessions || []).forEach((session: any) => {
        const sessionVariant = String(session.variation_type || '').toLowerCase();
        if (sessionVariant === normalizedVariant) {
          const competitorId = session.competitor_id || session.walmart_product_id;
          if (competitorId) {
            competitorCountsMap[competitorId] = (competitorCountsMap[competitorId] || 0) + 1;
          }
        }
      });


      const competitorResults = variantItems.map((item: any) => {
        const originalCompetitorProduct = item.competitor_product_id;
        const competitorId = String(originalCompetitorProduct?.id || '');

        const uniqueCompetitorProduct = {
          ...originalCompetitorProduct,
          id: `${competitorId}_${variant}`,
        };

        // Recalculate share_of_buy based on actual counts from sessions
        const competitorCount = Number(competitorCountsMap[competitorId] || 0);
        const recalculatedShareOfBuy = selections.total > 0 
          ? ((competitorCount / selections.total) * 100).toFixed(2)
          : '0.00';

        return {
          ...item,
          competitor_product_id: uniqueCompetitorProduct,
          // Use recalculated share_of_buy based on actual counts
          share_of_buy: recalculatedShareOfBuy,
          count: competitorCount,
        };
      });

      // Add test product to competitive insights with actual share based on sessions data
      if (testProduct) {
        const testProductCount = selections.testProduct;
        const recalculatedTestProductShareOfBuy = selections.total > 0 
          ? ((testProductCount / selections.total) * 100).toFixed(2)
          : '0.00';

        const testProductResult = {
          ...testProduct,
          variant_type: variant,
          // Mark this as a test product (not a competitor)
          isTestProduct: true,
          // Use actual share_of_buy based on sessions data
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

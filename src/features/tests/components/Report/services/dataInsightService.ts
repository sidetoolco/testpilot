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
    // Get summary data from database
    const { data: summaryData, error: summaryError } = await supabase
      .from('summary')
      .select('*, product:product_id(title)')
      .eq('test_id', id as any)
      .order('variant_type');

    if (summaryError) throw summaryError;

    // Robust Walmart detection with fallbacks
    const { data: walmartInsights } = await supabase
      .from('competitive_insights_walmart')
      .select('id')
      .eq('test_id', id as any)
      .limit(1);

    let isWalmartTest = !!(walmartInsights && walmartInsights.length > 0);

    if (!isWalmartTest) {
      const { data: sessionProbe } = await supabase
        .from('testers_session')
        .select('walmart_product_id')
        .eq('test_id', id as any)
        .limit(1);
      isWalmartTest = !!(sessionProbe && sessionProbe.some((r: any) => r.walmart_product_id));
    }

    if (!isWalmartTest) {
      const { data: compProbe } = await supabase
        .from('test_competitors')
        .select('product_type')
        .eq('test_id', id as any)
        .limit(1);
      isWalmartTest = !!(compProbe && compProbe.some((c: any) => c.product_type === 'walmart_product'));
    }

    // Use testers_session as source of truth for selections (exclude unknown rows)
    const { data: sessions, error: sessionsError } = await supabase
      .from('testers_session')
      .select('variation_type, product_id, competitor_id, walmart_product_id')
      .eq('test_id', id as any);

    if (sessionsError) throw sessionsError;

    const selectionsByVariant: { [variant: string]: { testProduct: number; competitors: number; total: number } } = {};

    (sessions || []).forEach((row: any) => {
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
      const variant = variantByProductId.get(String(row.product_id));
      if (!variant) return;
      if ((selectionsByVariant[variant]?.testProduct || 0) === 0) {
        selectionsByVariant[variant].testProduct = (selectionsByVariant[variant].testProduct || 0) + 1;
        selectionsByVariant[variant].total = (selectionsByVariant[variant].total || 0) + 1;
      }
    });

    // Recalculate summary data with correct share_of_buy values
    const correctedSummaryData = summaryData.map((item: any) => {
      const variant = item.variant_type;
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
    // Robust Walmart detection with fallbacks
    const { data: walmartInsights } = await supabase
      .from('competitive_insights_walmart')
      .select('id')
      .eq('test_id', id as any)
      .limit(1);

    let isWalmartTest = !!(walmartInsights && walmartInsights.length > 0);

    if (!isWalmartTest) {
      const { data: sessionProbe } = await supabase
        .from('testers_session')
        .select('walmart_product_id')
        .eq('test_id', id as any)
        .limit(1);
      isWalmartTest = !!(sessionProbe && sessionProbe.some((r: any) => r.walmart_product_id));
    }

    if (!isWalmartTest) {
      const { data: compProbe } = await supabase
        .from('test_competitors')
        .select('product_type')
        .eq('test_id', id as any)
        .limit(1);
      isWalmartTest = !!(compProbe && compProbe.some((c: any) => c.product_type === 'walmart_product'));
    }

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

    const { data: sessions2, error: sessionsError2 } = await supabase
      .from('testers_session')
      .select('id, variation_type, product_id, competitor_id, walmart_product_id')
      .eq('test_id', id as any);

    if (sessionsError2) throw sessionsError2;

    // Map tester_id -> variant from testers_session
    const variantByTesterId = new Map<string, string>();
    (sessions2 || []).forEach((row: any) => {
      const v = String(row.variation_type || '').toLowerCase();
      if (v === 'a' || v === 'b' || v === 'c') {
        variantByTesterId.set(String(row.id), v);
      }
    });

    // Build competitor counts per variant from COMPARISONS (ground truth)
    const comparisonTable2 = isWalmartTest ? 'responses_comparisons_walmart' : 'responses_comparisons';
    const { data: compData2, error: compErr2 } = await supabase
      .from(comparisonTable2)
      .select('competitor_id, tester_id')
      .eq('test_id', id as any);
    if (compErr2) throw compErr2;

    const competitorCountsByVariant: { [variant: string]: { [competitorId: string]: number } } = {};
    (compData2 || []).forEach((row: any) => {
      const variant = variantByTesterId.get(String(row.tester_id));
      if (!variant) return;
      const competitorId = String(row.competitor_id || '');
      if ((variant === 'a' || variant === 'b' || variant === 'c') && competitorId) {
        if (!competitorCountsByVariant[variant]) competitorCountsByVariant[variant] = {};
        competitorCountsByVariant[variant][competitorId] = (competitorCountsByVariant[variant][competitorId] || 0) + 1;
      }
    });

    // Count actual test product selections per variant from responses_surveys using test_variations mapping
    const { data: variations2, error: variationsError2 } = await supabase
      .from('test_variations')
      .select('variation_type, product_id')
      .eq('test_id', id as any);

    if (variationsError2) throw variationsError2;

    const variantByProductId2 = new Map<string, string>();
    (variations2 || []).forEach((v: any) => {
      const variant = String(v.variation_type || '').toLowerCase();
      if (variant === 'a' || variant === 'b' || variant === 'c') {
        variantByProductId2.set(String(v.product_id), variant);
      }
    });

    const { data: surveys2, error: surveysError2 } = await supabase
      .from('responses_surveys')
      .select('product_id')
      .eq('test_id', id as any);

    if (surveysError2) throw surveysError2;

    const testProductSelectionsByVariant: { [variant: string]: number } = {};

    // from testers_session: product pick rows (no competitor)
    (sessions2 || []).forEach((row: any) => {
      const variant = String(row.variation_type || '').toLowerCase();
      const isCompetitor = !!(row.competitor_id || row.walmart_product_id);
      const isTestProduct = !!row.product_id && !isCompetitor;
      if ((variant === 'a' || variant === 'b' || variant === 'c') && isTestProduct) {
        testProductSelectionsByVariant[variant] = (testProductSelectionsByVariant[variant] || 0) + 1;
      }
    });

    // from responses_surveys: map product_id back to owning variant
    // Use surveys as fallback only when sessions had zero test picks for a variant
    (surveys2 || []).forEach((row: any) => {
      const variant = variantByProductId2.get(String(row.product_id));
      if (!variant) return;
      if (!(testProductSelectionsByVariant[variant] > 0)) {
        testProductSelectionsByVariant[variant] = 1;
      }
    });

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

      // Calculate competitor selections for this variant from testers_session-derived counts
      const competitorCountsMap = competitorCountsByVariant[variant] || {};
      const competitorSelections = Object.values(competitorCountsMap).reduce((sum, n) => sum + Number(n || 0), 0);

      // Get actual test product selections from comparison data
      const testProductSelections = testProductSelectionsByVariant[variant] || 0;
      const totalSelections = competitorSelections + testProductSelections;


      const competitorResults = variantItems.map((item: any) => {
        const originalCompetitorProduct = item.competitor_product_id;
        const competitorId = String(originalCompetitorProduct?.id || '');

        const uniqueCompetitorProduct = {
          ...originalCompetitorProduct,
          id: `${competitorId}_${variant}`,
        };

        // Recalculate share_of_buy based on actual counts
        const competitorCount = Number((competitorCountsMap as any)[competitorId] || 0);
        const recalculatedShareOfBuy = totalSelections > 0 
          ? ((competitorCount / totalSelections) * 100).toFixed(2)
          : '0.00';

        return {
          ...item,
          competitor_product_id: uniqueCompetitorProduct,
          // Use recalculated share_of_buy based on actual counts
          share_of_buy: recalculatedShareOfBuy,
          count: competitorCount,
        };
      });

      // Add test product to competitive insights with actual share based on comparison data
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
          // Use actual share_of_buy based on comparison data
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

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
    const { data: summaryData, error: summaryError } = await supabase
      .from('competitive_insights')
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

      const testProduct = testProductData?.find((item: any) => item.variant_type === variant);

      const competitorSelections = variantItems.reduce(
        (sum: number, item: any) => sum + Number(item.count || 0),
        0
      );

      let testProductSelections = 0;
      if (testProduct && (testProduct as any).share_of_buy) {
        const testProductPercentage = Number((testProduct as any).share_of_buy);

        if (testProductPercentage >= 99.5) {
          testProductSelections = Math.max(competitorSelections * 100, 1000);
        } else if (testProductPercentage <= 0.5) {
          testProductSelections = Math.max(
            1,
            Math.round(competitorSelections * (testProductPercentage / 100))
          );
        } else {
          const estimatedTotalShoppers =
            (competitorSelections / (100 - testProductPercentage)) * 100;
          testProductSelections = Math.round(
            (testProductPercentage / 100) * estimatedTotalShoppers
          );
        }
      }

      const totalSelections = competitorSelections + testProductSelections;

      return variantItems.map((item: any) => {
        const originalCompetitorProduct = item.competitor_product_id;

        const competitorId = originalCompetitorProduct?.id || item.id || 'unknown';

        const uniqueCompetitorProduct = {
          ...originalCompetitorProduct,
          id: `${competitorId}_${variant}`,
        };

        const shareOfBuy =
          totalSelections > 0 ? (Number(item.count || 0) / totalSelections) * 100 : 0;

        return {
          ...item,
          competitor_product_id: uniqueCompetitorProduct,
          share_of_buy: shareOfBuy,
        };
      });
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
    console.log('Fetching AI insights from backend API for test:', testId);

    const response = await apiClient.get(`/insights/${testId}?type=ai`);

    console.log('AI insights fetched successfully from backend:', response.data);

    // Handle both array and single object responses
    let insights = response.data;
    if (Array.isArray(insights) && insights.length > 0) {
      insights = insights[0]; // Extract the first (and only) object from array
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

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
    const { data: summaryData, error: summaryError } = await supabase
      .from('competitive_insights')
      .select(
        '*, competitor_product_id: competitor_product_id(title, image_url, product_url,price)'
      )
      .eq('test_id', id);

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

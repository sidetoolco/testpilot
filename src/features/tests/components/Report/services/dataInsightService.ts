import { supabase } from '../../../../../lib/supabase';

// Checks if a given ID exists in the ia_insights table.
// Parameters:
//   - id (string): The ID to be checked.
// Returns: The first matching record or false if no match is found.
export const checkIdInIaInsights = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('ia_insights')
      .select('*') // Select all columns
      .eq('test_id', id);

    if (error) {
      console.error('Error fetching data:', error);
      return false;
    }

    return data.length > 0 ? data[0] : false; // Return the first match or false
  } catch (error) {
    console.error('Error checking ID:', error);
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
      const totalSelections = variantItems.reduce((sum: number, item: any) => sum + Number(item.count || 0), 0);
      
      return variantItems.map((item: any) => ({
        ...item,
        share_of_buy: totalSelections > 0 ? (Number(item.count || 0) / totalSelections) * 100 : 0
      }));
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

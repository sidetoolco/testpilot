import { supabase } from '../../../lib/supabase';

// Constants
export const LOW_SESSIONS_THRESHOLD = 10;

// Helper function to get completed sessions count for a test
export async function getCompletedSessionsCount(testId: string): Promise<number> {
  try {
    // First, try to get count from testers_session where ended_at is not null
    const { count: sessionEndedCount, error: sessionError } = await supabase
      .from('testers_session')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', testId as any)
      .not('ended_at', 'is', null);

    if (sessionError) {
      console.error('Error fetching completed sessions count from testers_session:', sessionError);
    }

    // If sessionEndedCount is 0 or low, fall back to counting distinct testers from comparison responses
    if (!sessionEndedCount || sessionEndedCount < LOW_SESSIONS_THRESHOLD) {
      const { data: testCompetitors } = await supabase
        .from('test_competitors')
        .select('product_type')
        .eq('test_id', testId as any)
        .limit(1);

      const isWalmartTest = testCompetitors?.some((c: any) => c.product_type === 'walmart_product');
      const comparisonTable = isWalmartTest ? 'responses_comparisons_walmart' : 'responses_comparisons';

      const { count: comparisonTestersCount, error: comparisonError } = await supabase
        .from(comparisonTable)
        .select('tester_id', { count: 'exact', head: true })
        .eq('test_id', testId as any);

      if (comparisonError) {
        console.error('Error fetching distinct testers from comparison responses:', comparisonError);
      }
      return comparisonTestersCount || 0;
    }

    return sessionEndedCount || 0;
  } catch (error) {
    console.error('Error in getCompletedSessionsCount:', error);
    return 0;
  }
}

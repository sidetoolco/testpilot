import { supabase } from '../../../lib/supabase';

export interface TestCompletionStatus {
  isCompleted: boolean;
  completedAt?: string;
  sessionId?: string;
}

export const checkTestCompletion = async (
  testId: string,
  variant: string,
  prolificPid?: string
): Promise<TestCompletionStatus> => {
  try {
    const query = supabase
      .from('testers_session')
      .select('id, ended_at, prolific_pid')
      .eq('test_id', testId)
      .eq('variation_type', variant);

    // If prolificPid is provided, filter by it for more precise checking
    if (prolificPid) {
      query.eq('prolific_pid', prolificPid);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking test completion:', error);
      return { isCompleted: false };
    }

    // Check if any session is completed (has ended_at)
    const completedSession = data?.find(session => session.ended_at);
    
    return {
      isCompleted: !!completedSession,
      completedAt: completedSession?.ended_at,
      sessionId: completedSession?.id,
    };
  } catch (error) {
    console.error('Error in checkTestCompletion:', error);
    return { isCompleted: false };
  }
};

export const markTestAsCompleted = async (sessionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('testers_session')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('Error marking test as completed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markTestAsCompleted:', error);
    return false;
  }
}; 
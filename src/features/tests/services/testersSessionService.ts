import { supabase } from "../../../lib/supabase";

export const checkAndFetchExistingSession = async () => {
    const existingSessionId = localStorage.getItem('testerSessionId');
    const testId = localStorage.getItem('testId');

    if (existingSessionId && testId) {
        const { data, error } = await supabase
            .from('testers_session')
            .select(`
                *,
                product_id:products(*),
                competitor_id:amazon_products(*)
            `)
            .eq('id', existingSessionId)
            .eq('test_id', testId);

        if (error) {
            console.error('Error fetching the existing session from the database:', error);
            return null;
        } else if (data && data.length > 0) {
            return data[0]; // Return the existing session data
        }
    }
    return null;
};
export const createNewSession = async (testId: string, combinedData: any) => {
    try {
        const { data, error } = await supabase
            .from('testers_session')
            .insert([{ test_id: testId, status: 'started' }])
            .select('id');

        if (error) {
            console.error('Error saving to the database:', error);
            return null;
        } else if (data && data.length > 0 && combinedData) {
            const sessionId = data[0].id;
            localStorage.setItem('testerSessionId', sessionId); // Store the ID in localStorage
            localStorage.setItem('testId', testId); // Store the ID in localStorage
            return sessionId;
        }
    } catch (error) {
        console.error('Error attempting to save to the database:', error);
    }
    return null;
};

interface CombinedData {
    sessionId: any;
    id: string;
    asin: string;
}

export const updateSession = async (combinedData: CombinedData, sessionId: any): Promise<string | null> => {
    if (!combinedData || !sessionId) {
        console.error('Invalid parameters: testId or combinedData is missing');
        return null;
    }
    const isCompetitor = combinedData.asin;
    const column = isCompetitor ? 'competitor_id' : 'product_id';

    try {
        const { error } = await supabase
            .from('testers_session')
            .update({ status: 'questions', [column]: combinedData.id } as any)
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

export async function recordTimeSpent(testId: string, itemId: string, startTime: number, endTime: number, isCompetitor: boolean = false): Promise<void> {
    const timeSpent = Math.floor(endTime - startTime);
    const column = isCompetitor ? 'competitor_id' : 'product_id';

    try {
        // Check if the record already exists
        const { data: existingData, error: fetchError } = await supabase
            .from('test_times')
            .select('id, time_spent')
            .eq('testers_session', testId)
            .eq(column, itemId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the code for no rows found
            throw fetchError;
        }

        if (existingData) {
            // Update the existing record
            const newTimeSpent = existingData.time_spent + (timeSpent / 1000);
            const { error: updateError } = await supabase
                .from('test_times')
                .update({ time_spent: newTimeSpent } as any)
                .eq('id', existingData.id);

            if (updateError) {
                throw updateError;
            }

            console.log('Time updated successfully:', newTimeSpent);
        } else {
            // Insert a new record
            const { data, error: insertError } = await supabase
                .from('test_times')
                .insert([
                    { testers_session: testId, [column]: itemId, time_spent: timeSpent / 1000 }
                ] as any);

            if (insertError) {
                throw insertError;
            }

            console.log('Data inserted successfully:', data);
        }
    } catch (error) {
        console.error('Error processing time spent:', error);
    }
}


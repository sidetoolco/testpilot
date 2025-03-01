import { supabase } from "../../../lib/supabase";
import { TestData } from "../types";

export const checkAndFetchExistingSession = async (id: string, variant: string) => {
    if (!id) {
        return null;
    }
    const existingSessionId = localStorage.getItem('testerSessionId');
    const testId = id;
    const variationType = variant;

    if (existingSessionId && testId) {
        const { data, error } = await supabase
            .from('testers_session')
            .select(`
                *,
                product_id:products(*),
                competitor_id:amazon_products(*)
            `)
            .eq('id', existingSessionId)
            .eq('test_id', testId)
            .eq('variation_type', variationType)
            .single();

        if (error) {
            console.error('Error fetching the existing session from the database:', error);
            return null;
        } else if (data) {
            return data; // Return the existing session data
        }
    }
    return null;

};
export const createNewSession = async (testIdraw: string, combinedData: any) => {
    const result = processString(testIdraw);
    const testId = result?.modifiedString ? result?.modifiedString : '';
    const variationType = result?.lastCharacter ? result?.lastCharacter : '';
    try {
        const { data, error } = await supabase
            .from('testers_session')
            .insert([{ test_id: testId, status: 'started', variation_type: variationType } as any])
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
        // Fetch the current session to check existing competitor_id or product_id
        const { data: existingData, error: fetchError } = await supabase
            .from('testers_session')
            .select('competitor_id, product_id')
            .eq('id', sessionId)
            .single();

        if (fetchError) {
            console.error('Error fetching current session data:', fetchError);
            return null;
        }

        // Prepare the update object to clear existing IDs
        const updateObject: any = { status: 'questions', [column]: combinedData.id };
        if (existingData) {
            if (existingData.competitor_id) updateObject.competitor_id = null;
            if (existingData.product_id) updateObject.product_id = null;
        }

        // Update the session
        const { error } = await supabase
            .from('testers_session')
            .update(updateObject)
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

export const processString = (input: string) => {
    if (input.length < 2) {
        console.error("Input string is too short.");
        return null;
    }
    // Cut the last two characters
    const modifiedString = input.slice(0, -2);
    // Store the last character
    const lastCharacter = input.slice(-1);
    return { modifiedString, lastCharacter };
}

export const fetchProductAndCompetitorData = async (id: string): Promise<TestData | null> => {
    const result = processString(id);
    const variationType = result?.lastCharacter ? result?.lastCharacter : '';
    const testId = result?.modifiedString ? result?.modifiedString : '';

    try {
        const { data, error } = await supabase
            .from('tests')
            .select(`
                *,
                competitors:test_competitors(
                  product:amazon_products(
                    *,
                    company:companies(name)
                  )
                ),
                variations:test_variations(
                  product:products(
                    *,
                    company:companies(name)
                  ),
                  variation_type
                )
            `)
            .eq('id', testId)
            .eq('variations.variation_type', variationType)
            .single();

        if (error) throw new Error(`Error fetching test data: ${error.message}`);
        if (!data || !('variations' in data)) {
            throw new Error('No variations found');
        }

        const sessionData = (data.variations as any[]).map((session: any) => {
            if (session.product && session.product.company?.name) {
                session.product.brand = session.product.company.name;
                delete session.product.company;
            }
            return session;
        });

        return { ...data, variations: sessionData } as unknown as TestData;
    } catch (error) {
        console.error('Error fetching test data:', error);
        return null;
    }
};


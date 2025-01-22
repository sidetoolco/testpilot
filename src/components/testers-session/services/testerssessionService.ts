import { supabase } from "../../../lib/supabase";

export const checkAndFetchExistingSession = async () => {
    const existingSessionId = localStorage.getItem('testerSessionId');
    const testId = localStorage.getItem('testId');

    if (existingSessionId && testId) {
        alert('A tester session with ID: ' + existingSessionId + ' already exists.');

        // Fetch the existing session from the database
        const { data, error } = await supabase
            .from('testers_session')
            .select('*')
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
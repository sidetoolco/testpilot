import { useState, useEffect } from 'react';
import { Test } from '../../../types';
import { toast } from 'sonner';
import { testService } from '../services/testService';
import { io } from 'socket.io-client';

export function useTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:8080', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socketInstance.on('connect_error', error => {
      console.error('Socket connection error:', error);
    });

    // Listen for test status updates
    socketInstance.on('testStatusUpdate', ({ testId, status }) => {
      setTests(prevTests =>
        prevTests.map(test => (test.id === testId ? { ...test, status } : test))
      );
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    async function fetchTests() {
      try {
        setLoading(true);
        setError(null);

        const data = await testService.getAllTests();

        // Transform the data to match our Test type
        const transformedTests: Test[] = (data || []).map(test => ({
          id: test.id,
          name: test.name,
          status: test.status as 'draft' | 'active' | 'complete' | 'incomplete',
          searchTerm: test.search_term,
          competitors: test.competitors?.map((c: any) => c.product) || [],
          variations: {
            a: test.variations?.find((v: any) => v.variation_type === 'a')?.product || null,
            b: test.variations?.find((v: any) => v.variation_type === 'b')?.product || null,
            c: test.variations?.find((v: any) => v.variation_type === 'c')?.product || null,
          },
          demographics: {
            ageRanges: test.demographics?.[0]?.age_ranges || [],
            gender: test.demographics?.[0]?.genders || [],
            locations: test.demographics?.[0]?.locations || [],
            interests: test.demographics?.[0]?.interests || [],
            testerCount: test.demographics?.[0]?.tester_count || 0,
            customScreening: {
              question: test.custom_screening?.[0]?.question || '',
              validAnswer: (() => {
                const validOption = test.custom_screening?.[0]?.valid_option;
                return validOption === 'Yes' || validOption === 'No' ? validOption : undefined;
              })(),
            },
          },
          responses: {
            surveys: [],
            comparisons: [],
          },
          completed_sessions: 0,
          createdAt: test.created_at,
          updatedAt: test.updated_at,
        }));

        setTests(transformedTests);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tests:', err);
        setError(err.message);
        toast.error('Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    }

    fetchTests();
  }, []);

  return { tests, loading, error };
}

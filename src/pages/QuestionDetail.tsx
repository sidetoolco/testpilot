import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import apiClient from '../lib/api';
import { getTracker } from '../lib/openReplay';

interface CustomScreening {
  id: string;
  question: string;
  options: string[];
  created_at: string;
  valid_option: string;
  invalid_option: string;
}

const QuestionDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();

  const prolificPid = searchParams.get('PROLIFIC_PID');
  const prolificStudyId = searchParams.get('STUDY_ID');

  useEffect(() => {
    if (id && prolificPid) {
      const tracker = getTracker(`screeningID:${id}-prolificPID:${prolificPid}`);
      tracker.trackWs('PageEvents')?.(
        'Screening Page Loaded',
        JSON.stringify({ screeningId: id, prolificPid }),
        'down'
      );
    }
  }, [id, prolificPid]);

  const {
    data: screening,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customScreening', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');

      const { data, error } = await supabase
        .from('custom_screening')
        .select('*')
        .eq('test_id', id.slice(0, -2))
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data found');

      return {
        id: data.id,
        question: data.question,
        options: data.options || [],
        created_at: data.created_at,
        valid_option: data.valid_option,
        invalid_option: data.invalid_option,
      } as CustomScreening;
    },
    enabled: !!id,
  });

  const handleOptionClick = (option: string) => {
    if (option === screening?.valid_option) {
      const queryString = searchParams.toString();
      navigate(`/test/${id}${queryString ? `?${queryString}` : ''}`);
    } else if (option === screening?.invalid_option) {
      apiClient
        .post('/prolific/submission/screen-out', {
          studyId: prolificStudyId,
          participantId: prolificPid,
          studyInternalName: id,
        })
        .catch(err => console.error(`Failed to screen out submission`, err))
        .finally(
          () =>
            (window.location.href = 'https://app.prolific.com/submissions/complete?cc=SCREENED-OUT')
        );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading question details
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Question Details</h1>
      <div className="space-y-6">
        {screening ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Question</h2>
              <p className="text-gray-700">{screening.question}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Options</h3>
              <div className="grid gap-4">
                <button
                  onClick={() => handleOptionClick(screening.valid_option)}
                  className="w-full p-4 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                >
                  {screening.valid_option}
                </button>
                <button
                  onClick={() => handleOptionClick(screening.invalid_option)}
                  className="w-full p-4 text-left bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  {screening.invalid_option}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No question details found
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;

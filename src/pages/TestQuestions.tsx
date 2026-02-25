import { useState, useCallback, useEffect } from 'react';
import { useSessionStore } from '../store/useSessionStore';
import { useTestCompletionStore } from '../store/useTestCompletionStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { getTracker } from '../lib/openReplay';
import { ComparisonView } from '../features/tests/components/TestQuestions/ComparisonView';
import { SelectedVariation } from '../features/tests/components/TestQuestions/SelectedVariation';
import { compareTwoStrings } from 'string-similarity';
import FeedbackModal from '../features/tests/components/TestQuestions/FeedbackModal';
import { ProlificCompletionCode } from '../lib/enum';
import { getQuestionsByIds, getDefaultQuestions } from '../features/tests/components/TestQuestions/questionConfig';

const REPEATED_STRING_ERROR_MSG = 'Please provide different feedback for each response.';

const TestDisplay: React.FC = () => {
  const { test, itemSelectedAtCheckout, shopperId, sessionBeginTime } = useSessionStore(
    state => state
  );
  const { markTestCompleted } = useTestCompletionStore();
  const competitorItem = test?.variations?.[0]?.product;
  const navigate = useNavigate();

  // Get selected questions from database or use defaults
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const questionConfigs = getQuestionsByIds(selectedQuestions);
  
  // Fetch survey questions from database
  useEffect(() => {
    if (test?.id) {
      const fetchSurveyQuestions = async () => {
        setQuestionsLoading(true);
        try {
          const { data, error } = await supabase
            .from('test_survey_questions')
            .select('selected_questions')
            .eq('test_id', test.id)
            .single();
          
          if (error) {
            console.log('Survey questions query error:', error.message, 'Code:', error.code);
            if (error.code === 'PGRST116') {
              console.log('No survey questions found for this test, using defaults');
            } else if (error.code === '406') {
              console.log('RLS policy blocking access to survey questions, using defaults');
            } else {
              console.log('Other error fetching survey questions, using defaults');
            }
            setSelectedQuestions(getDefaultQuestions());
          } else if (data && 'selected_questions' in data) {
            console.log('Successfully loaded survey questions from database');
            setSelectedQuestions((data as any).selected_questions);
          } else {
            console.log('No survey questions data found, using defaults');
            setSelectedQuestions(getDefaultQuestions());
          }
        } catch (error) {
          console.error('Exception fetching survey questions:', error);
          setSelectedQuestions(getDefaultQuestions());
        }
        setQuestionsLoading(false);
      };
      
      fetchSurveyQuestions();
    }
  }, [test?.id]);

  // Create dynamic responses object based on selected questions
  const createInitialResponses = () => {
    const initialResponses: any = {
      likes_most: '',
      improve_suggestions: '',
      choose_reason: '',
    };
    
    // Add rating fields for selected questions
    questionConfigs.forEach(question => {
      if (question.category === 'rating') {
        initialResponses[question.field] = 3;
      }
    });
    
    return initialResponses;
  };

  const [responses, setResponses] = useState(createInitialResponses());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Recreate responses when selectedQuestions changes
  useEffect(() => {
    if (selectedQuestions.length > 0) {
      setResponses(createInitialResponses());
    }
  }, [selectedQuestions]);

  const stringFields = ['likes_most', 'improve_suggestions', 'choose_reason'];
  // Get rating fields from selected questions
  const ratingFields = questionConfigs
    .filter(question => question.category === 'rating')
    .map(question => question.field);

  const handleChange = useCallback(
    (e: any) => {
      const { name, value } = e.target;

      if (errors[name]) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
      }

      if (shopperId && test) {
        const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + test.id);
        tracker.trackWs('InputEvents')?.(
          'Input Changed',
          JSON.stringify({ fieldName: name, value: value }),
          'up'
        );
      }

      setResponses((prevResponses: any) => ({
        ...prevResponses,
        [name]: stringFields.includes(name) ? value : Number(value),
      }));
    },
    [shopperId, test?.id, errors]
  );

  const validateFields = () => {
    let validationErrors: Record<string, string> = {};
    const selectedVariations =
      test?.variations?.filter(
        (variation: any) => variation.product.id === itemSelectedAtCheckout?.id
      ) || [];
    const isSelected = selectedVariations.length > 0;

    if (isSelected) {
      if (!responses.likes_most || responses.likes_most.trim().length <= 50) {
        validationErrors.likes_most = 'You must write at least 50 characters.';
      }
      if (!responses.improve_suggestions || responses.improve_suggestions.trim().length <= 50) {
        validationErrors.improve_suggestions = 'You must write at least 50 characters.';
      }
    } else {
      if (!responses.likes_most || responses.likes_most.trim().length <= 50) {
        validationErrors.likes_most = 'You must write at least 50 characters.';
      }
      if (!responses.improve_suggestions || responses.improve_suggestions.trim().length <= 50) {
        validationErrors.improve_suggestions = 'You must write at least 50 characters.';
      }
      if (!responses.choose_reason || responses.choose_reason.trim().length <= 50) {
        validationErrors.choose_reason = 'You must write at least 50 characters.';
      }
    }

    if (
      responses.likes_most &&
      responses.improve_suggestions &&
      compareTwoStrings(
        responses.likes_most.trim().toLowerCase(),
        responses.improve_suggestions.trim().toLowerCase()
      ) >= 0.8
    ) {
      validationErrors.improve_suggestions = REPEATED_STRING_ERROR_MSG;
      validationErrors.likes_most = REPEATED_STRING_ERROR_MSG;
    }

    return validationErrors;
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const validationErrors = validateFields();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (!test || !shopperId) {
        console.error('Test data or shopper ID is missing.');
        return;
      }

      const isComparison =
        test.variations?.length > 0 &&
        !test.variations.filter(
          (variation: any) => variation.product.id === itemSelectedAtCheckout?.id
        ).length;
      const productId = isComparison ? competitorItem?.id : itemSelectedAtCheckout?.id;

      if (!productId) {
        console.error('Product ID is missing.');
        return;
      }
      console.log(responses);

      // Create dynamic payload based on selected questions
      const payload: any = {
        test_id: test.id,
        tester_id: shopperId,
        product_id: productId,
        likes_most: responses.likes_most,
        improve_suggestions: responses.improve_suggestions,
        ...(isComparison ? { competitor_id: itemSelectedAtCheckout?.id } : {}),
        ...(isComparison ? { choose_reason: responses.choose_reason } : {}),
      };
      
      // Add rating fields for selected questions
      questionConfigs.forEach(question => {
        if (question.category === 'rating') {
          payload[question.field] = Number(responses[question.field]);
        }
      });

      // Use the appropriate table based on test skin
      const tableName = isComparison 
        ? (
            test.skin === 'walmart'
              ? 'responses_comparisons_walmart'
              : test.skin === 'tiktokshop'
                ? 'responses_comparisons_tiktok'
                : 'responses_comparisons'
          )
        : 'responses_surveys';

      const { data, error } = await supabase.from(tableName).insert([payload] as any);

      if (error) {
        console.error(`Error inserting data into ${tableName}:`, error);
        return;
      }

      const { error: updateError } = await supabase
        .from('testers_session')
        .update({ ended_at: new Date() } as any)
        .eq('id', shopperId as any);

      if (updateError) {
        console.error('Error updating testers session:', updateError);
        return;
      }

      // Mark test as completed in localStorage
      if (test) {
        const testId = test.id;
        const variant = test.variations?.[0]?.variation_type || 'A';
        markTestCompleted(testId, variant);
      }

      console.log('Data saved successfully:', data);

      setShowFeedbackModal(true);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = () => {
    if (!test) return;

    // Calculate session duration in minutes
    const sessionDuration = sessionBeginTime
      ? (new Date().getTime() - new Date(sessionBeginTime).getTime()) / (1000 * 60)
      : null;

    if (sessionDuration !== null && sessionDuration < 2) {
      window.location.href = `https://app.prolific.com/submissions/complete?cc=${ProlificCompletionCode.REJECTED_BY_TIME}`;
    } else {
      navigate('/thanks', {
        state: {
          testId: test.id + '-' + test.variations[0].variation_type,
        },
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!test) {
    return <div>No test data available</div>;
  }

  const isVariationSelected = test.variations?.filter(
    (variation: any) => variation.product.id === itemSelectedAtCheckout?.id
  );

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-3xl font-bold mb-2 text-center">Last step, quick survey!</h2>
      <p className="text-center">
        <strong>Search Term:</strong> {test.search_term}
      </p>
      {questionsLoading ? (
        <div className="text-center py-8">
          <p>Loading questions...</p>
        </div>
      ) : isVariationSelected.length > 0 ? (
        <SelectedVariation
          loading={loading}
          responses={responses}
          item={itemSelectedAtCheckout}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          errors={errors}
          selectedQuestions={selectedQuestions}
        />
      ) : (
        <ComparisonView
          loading={loading}
          responses={responses}
          competitorItem={competitorItem}
          itemSelected={itemSelectedAtCheckout}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          errors={errors}
          selectedQuestions={selectedQuestions}
        />
      )}
      <FeedbackModal
        isOpen={showFeedbackModal}
        handleModalClose={() => setShowFeedbackModal(false)}
        isSelectedVariation={isVariationSelected.length}
        handleSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default TestDisplay;

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useStepValidation } from '../features/tests/hooks/useStepValidation';
import { testService } from '../features/tests/services/testService';
import { TestCreationSteps } from '../features/tests/components/TestCreationSteps';
import { TestCreationContent } from '../features/tests/components/TestCreationContent';
import { TestData } from '../features/tests/types';
import {
  useTestStateFromLocation,
} from '../features/tests/utils/testStateManager';
import { useTestCreation } from '../features/tests/context/TestCreationContext';
import { useCredits } from '../features/credits/hooks/useCredits';
import { PurchaseCreditsModal } from '../features/credits/components/PurchaseCreditsModal';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import ModalLayout from '../layouts/ModalLayout';
import { validateTestDataWithToast } from '../features/tests/utils/testValidation';
import { TestCost } from '../components/test-setup/TestCost';
import apiClient from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useExpertMode } from '../hooks/useExpertMode';

const getInitialTestData = (expertMode: boolean): TestData => ({
  name: '',
  searchTerm: '',
  competitors: [],
  objective: null,
  variations: {
    a: null,
    b: null,
    c: null,
  },
  demographics: {
    ageRanges: [],
    gender: [],
    locations: [],
    interests: [],
    testerCount: 25,
    customScreening: {
      enabled: false,
    },
  },
  surveyQuestions: expertMode ? ['value', 'appearance', 'confidence', 'brand', 'convenience'] : ['value', 'appearance', 'confidence', 'brand', 'convenience'],
  skin: 'amazon',
});

const LoadingMessages = [
  'Creating your test...',
  'Analyzing demographics...',
  'Setting up your project...',
  'Almost there...',
  'Finalizing details...',
];

const CREDITS_PER_TESTER = 1;
const CREDITS_PER_TESTER_CUSTOM_SCREENING = 1.1;

export default function CreateConsumerTest() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if company has expert mode enabled
  const { expertMode } = useExpertMode();
  
  const user = useAuth();
  const queryClient = useQueryClient();
  const [testData, setTestData] = useState<TestData>(() => getInitialTestData(expertMode));
  const { currentStep, setCurrentStep, canProceed, handleNext } = useStepValidation(testData);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [demographicsValid, setDemographicsValid] = useState(true);
  const [surveyQuestionsValid, setSurveyQuestionsValid] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [publishModal, setPublishModal] = useState<{ isOpen: boolean; testData: TestData } | null>(null);

  // Get incomplete test state from navigation
  const testState = useTestStateFromLocation();

  // Use the test creation context
  const {
    setTestData: setContextTestData,
    setCurrentStep: setContextStep,
    setCurrentTestId: setContextTestId,
    setIsInProgress,
    setSaveIncompleteTest,
  } = useTestCreation();

  // Get user's available credits
  const { data: creditsData, isLoading: creditsLoading } = useCredits();

  // Dynamic steps based on expert mode
  const steps = [
    { key: 'objective', label: 'Objective' },
    { key: 'variations', label: 'Variants' },
    { key: 'search-term', label: 'Search Term' },
    { key: 'search-competitors', label: 'Search Competitors' },
    { key: 'skin-selection', label: 'Skin Selection' },
    { key: 'demographics', label: 'Demographics' },
    ...(expertMode ? [{ key: 'survey-questions', label: 'Survey Questions' }] : []),
    { key: 'preview', label: 'Preview' },
    { key: 'review', label: 'Review' },
  ];

  // Effect to initialize incomplete test if coming from navigation
  useEffect(() => {
    // Only initialize if it's an incomplete test AND hasn't been initialized yet
    if (testState.isIncompleteTest && testState.testData && !currentTestId) {
      // Load test data
      setTestData(testState.testData);
      setContextTestData(testState.testData);

      // Set test ID
      if (testState.testId) {
        setCurrentTestId(testState.testId);
        setContextTestId(testState.testId);
      }
    }
  }, [testState.isIncompleteTest, testState.testData, testState.testId, currentTestId, setContextTestData, setContextTestId]);

  // Effect to update test data when expert mode changes
  const prevExpertModeRef = useRef(expertMode);
  useEffect(() => {
    if (testData.surveyQuestions && !expertMode && prevExpertModeRef.current !== expertMode) {
      prevExpertModeRef.current = expertMode;
      const defaultQuestions = ['value', 'appearance', 'confidence', 'brand', 'convenience'];
      if (JSON.stringify(testData.surveyQuestions) !== JSON.stringify(defaultQuestions)) {
        setTestData(prev => ({
          ...prev,
          surveyQuestions: defaultQuestions
        }));
      }
    }
  }, [expertMode, testData.surveyQuestions, setTestData]);

  // Effect to set the correct step
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (testState.currentStep && testState.currentStep !== prevStepRef.current) {
      prevStepRef.current = testState.currentStep;
      setCurrentStep(testState.currentStep);
      setContextStep(testState.currentStep);
    }
  }, [
    testState.currentStep,
    setContextStep
  ]);

  // Function to save incomplete test - memoized with useCallback
  const saveIncompleteTest = useCallback(async () => {
    try {
      const savedTest = await testService.saveIncompleteTest(
        testData,
        currentTestId || undefined,
        currentStep
      );
      if (!currentTestId) {
        setCurrentTestId((savedTest as any).id);
        setContextTestId((savedTest as any).id);
      }
      toast.success('Test saved successfully');
    } catch (error) {
      console.error('Error saving incomplete test:', error);
      throw error;
    }
  }, [testData, currentTestId, currentStep, setContextTestId, testService]);

  // Register saveIncompleteTest function with context
  const prevSaveFunctionRef = useRef(saveIncompleteTest);
  useEffect(() => {
    if (prevSaveFunctionRef.current !== saveIncompleteTest) {
      prevSaveFunctionRef.current = saveIncompleteTest;
      setSaveIncompleteTest(saveIncompleteTest);
    }
  }, [setSaveIncompleteTest, saveIncompleteTest]);

  // Update context state when local state changes - only when values actually change
  useEffect(() => {
    setContextTestData(testData);
    setContextStep(currentStep);
    setContextTestId(currentTestId);
  }, [testData, currentStep, currentTestId, setContextTestData, setContextStep, setContextTestId]);

  // Set in progress when on create-test page
  useEffect(() => {
    setIsInProgress(true);
    return () => {
      setIsInProgress(false);
    };
  }, []);

  const handleBack = () => {
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      let prevStep = steps[currentIndex - 1].key;
      
      // If moving back from preview and expert mode is disabled, skip survey questions
      if (currentStep === 'preview' && !expertMode && prevStep === 'survey-questions') {
        prevStep = 'demographics';
      }
      
      setCurrentStep(prevStep);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Validate test data before saving
      if (!validateTestDataWithToast(testData, toast)) {
        return;
      }

      setIsLoading(true);

      // Check if it's an existing incomplete test
      if (testState.isIncompleteTest && currentTestId) {
        try {
          // Update incomplete test to draft and update data
          await testService.updateIncompleteTestToDraft(currentTestId, testData);
          toast.success('Test saved as draft successfully');
          navigate('/my-tests');
          return;
        } catch (updateError) {
          console.error('Error updating incomplete test:', updateError);
          toast.error('Failed to save test as draft. Creating new test instead.');
          // If update fails, continue with normal flow to create new test
        }
      }

      // Create test as draft (normal flow for new tests)
      await testService.createTest(testData);

      toast.success('Test saved as draft successfully');
      navigate('/my-tests');
    } catch (error: any) {
      console.error('Test creation error:', error);
      const errorMessage = error.details?.errors?.[0] || error.message || 'Failed to save test';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishClick = () => {
    // Validate test data before showing modal
    if (!validateTestDataWithToast(testData, toast)) {
      return;
    }

    // Don't proceed if credits are still loading
    if (creditsLoading) {
      toast.error('Please wait while we load your credit balance...');
      return;
    }

    const activeVariants = Object.values(testData.variations).filter(v => v !== null).length;
    const totalTesters = testData.demographics.testerCount * activeVariants;

    const hasCustomScreening = testData.demographics.customScreening?.enabled && 
      testData.demographics.customScreening.question && 
      testData.demographics.customScreening.validAnswer;
    const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
    const totalCredits = totalTesters * creditsPerTester;
    
    const availableCredits = creditsData?.total || 0;
    if (availableCredits < totalCredits) {
      const creditsNeeded = totalCredits - availableCredits;
      toast.error(`Insufficient credits. You need ${creditsNeeded.toFixed(1)} more credits to publish this test.`);
      return;
    }

    setPublishModal({ isOpen: true, testData });
  };

  const handlePublishConfirm = async () => {
    try {
      setIsLoading(true);
      setPublishModal(null);

      // Calculate credits needed for this test
      const activeVariants = Object.values(testData.variations).filter(v => v !== null).length;
      const totalTesters = testData.demographics.testerCount * activeVariants;
      const hasCustomScreening = testData.demographics.customScreening?.enabled && 
        testData.demographics.customScreening.question && 
        testData.demographics.customScreening.validAnswer;
      const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
      const totalCredits = totalTesters * creditsPerTester;
      const availableCredits = creditsData?.total || 0;

      // Get user's company ID
      if (!user?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.user.id as any)
        .single();

      if (profileError || !profile || !profile.company_id) {
        throw new Error('Unable to get company information');
      }

      const typedProfile = profile as { company_id: string };

      // Check if it's an existing incomplete test
      if (testState.isIncompleteTest && currentTestId) {
        try {
          // Update incomplete test to draft and update data
          await testService.updateIncompleteTestToDraft(currentTestId, testData);

          // Proceed with normal launch (create Prolific projects)
          await testService.createProlificProjectsForTest(currentTestId, testData);

          // Deduct credits after successful publication
          await apiClient.post('/credits/admin/edit', {
            company_id: typedProfile.company_id,
            credits: availableCredits - totalCredits, // new total after deduction
            description: `Credits deducted for publishing test: ${testData.name}`
          });

          // Refresh credits cache to show updated balance
          await queryClient.invalidateQueries({ queryKey: ['credits'] });

          toast.success('Test published successfully');
          navigate('/my-tests');
          return;
        } catch (updateError) {
          console.error('Error updating incomplete test:', updateError);
          toast.error('Failed to update incomplete test. Creating new test instead.');
          // If update fails, continue with normal flow to create new test
        }
      }

      // Create test (normal flow for new tests)
      await testService.createTest(testData);

      // Deduct credits after successful publication
      await apiClient.post('/credits/admin/edit', {
        company_id: typedProfile.company_id,
        credits: availableCredits - totalCredits, // new total after deduction
        description: `Credits deducted for publishing test: ${testData.name}`
      });

      // Refresh credits cache to show updated balance
      await queryClient.invalidateQueries({ queryKey: ['credits'] });

      toast.success('Test published successfully');
      navigate('/my-tests');
    } catch (error: any) {
      console.error('Test creation error:', error);
      const errorMessage = error.details?.errors?.[0] || error.message || 'Failed to publish test';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (handleNext()) {
      const currentIndex = steps.findIndex(s => s.key === currentStep);
      if (currentIndex < steps.length - 1) {
        let nextStep = steps[currentIndex + 1].key;
        
        // If moving from demographics and expert mode is disabled, skip survey questions
        if (currentStep === 'demographics' && !expertMode && nextStep === 'survey-questions') {
          nextStep = 'preview';
        }
        
        setCurrentStep(nextStep);
      }
    }
  };

  // Custom canProceed function that considers demographics and survey questions validation
  const canProceedWithValidation = () => {
    if (currentStep === 'demographics') {
      return demographicsValid;
    }
    if (currentStep === 'survey-questions' && expertMode) {
      return surveyQuestionsValid;
    }
    if (currentStep === 'search-competitors') {
      return testData.searchTerm.trim().length > 0 && testData.competitors.length === 11;
    }
    return canProceed();
  };

  // Check if user can publish (has sufficient credits)
  const canPublish = () => {
    if (currentStep !== 'review') return false;
    
    // Don't enable publish button if credits are still loading
    if (creditsLoading) return false;
    
    const activeVariants = Object.values(testData.variations).filter(v => v !== null).length;
    const totalTesters = testData.demographics.testerCount * activeVariants;
    
    // Calculate credits based on custom screening
    const hasCustomScreening = testData.demographics.customScreening?.enabled && 
      testData.demographics.customScreening.question && 
      testData.demographics.customScreening.validAnswer;
    const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
    const totalCredits = totalTesters * creditsPerTester;
    
    // Check if user has sufficient credits - only if credits data is available
    if (!creditsData) return false;
    const availableCredits = creditsData.total || 0;
    return availableCredits >= totalCredits;
  };

  // Effect to change messages
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((current: number) =>
          current < LoadingMessages.length - 1 ? current + 1 : current
        );
      }, 4000); // Change every 4 seconds

      return () => {
        clearInterval(interval);
        setLoadingMessageIndex(0); // Reset on close
      };
    }
  }, [isLoading]);

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-white relative w-full">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-lg font-semibold text-gray-800 text-center min-h-[2rem] transition-all duration-500">
              {LoadingMessages[loadingMessageIndex]}
            </p>
            <div className="flex gap-1 mt-2">
              {LoadingMessages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    index === loadingMessageIndex ? 'bg-blue-500 w-3' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep !== 'objective' && (
        <TestCreationSteps
          steps={steps.slice(1)}
          currentStep={currentStep}
          canProceed={canProceedWithValidation()}
          onBack={handleBack}
          onNext={handleContinue}
          onConfirm={handleSaveDraft}
          onPublish={handlePublishClick}
          canPublish={canPublish()}
        />
      )}

        <TestCreationContent
          currentStep={currentStep}
          testData={testData}
          onUpdateTestData={setTestData}
          onNext={handleContinue}
          onBack={handleBack}
          demographicsValid={demographicsValid}
          setDemographicsValid={setDemographicsValid}
          surveyQuestionsValid={surveyQuestionsValid}
          setSurveyQuestionsValid={setSurveyQuestionsValid}
          expertMode={expertMode}
        />

        {/* Purchase Credits Modal */}
      <PurchaseCreditsModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        creditsNeeded={undefined}
      />

      {/* Publish Confirmation Modal */}
      {publishModal && (
        <ModalLayout
          isOpen={publishModal.isOpen}
          onClose={() => setPublishModal(null)}
          title="Confirm Publication"
        >
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Are you sure you want to publish the test "{publishModal.testData.name}"?
            </p>
            <p className="text-gray-500 text-sm">
              This will make the test available on Prolific and start collecting responses.
            </p>

            {/* Credit Information */}
            {(() => {
              const activeVariants = Object.values(publishModal.testData.variations).filter(v => v !== null).length;
              const totalTesters = publishModal.testData.demographics.testerCount * activeVariants;
              const hasCustomScreening = publishModal.testData.demographics.customScreening?.enabled && 
                publishModal.testData.demographics.customScreening.question && 
                publishModal.testData.demographics.customScreening.validAnswer;
              const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
              const totalCredits = totalTesters * creditsPerTester;
              
              return (
                <TestCost
                  totalTesters={totalTesters}
                  creditsPerTester={creditsPerTester}
                  totalCredits={totalCredits}
                  size="small"
                />
              );
            })()}

            <p className="text-sm text-gray-500 mt-4">
              This action will make the test available on Prolific.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setPublishModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishConfirm}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Confirm Publication
              </button>
            </div>
          </div>
        </ModalLayout>
      )}
    </div>
    </Elements>
  );
}

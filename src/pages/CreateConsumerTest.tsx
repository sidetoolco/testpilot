import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useStepValidation } from '../features/tests/hooks/useStepValidation';
import { testService } from '../features/tests/services/testService';
import { TestCreationSteps } from '../features/tests/components/TestCreationSteps';
import { TestCreationContent } from '../features/tests/components/TestCreationContent';
import { TestData } from '../features/tests/types';
import {
  useTestStateFromLocation,
  initializeTestFromState,
} from '../features/tests/utils/testStateManager';
import { useTestCreation } from '../features/tests/context/TestCreationContext';
import { useCredits } from '../features/credits/hooks/useCredits';
import { PurchaseCreditsModal } from '../features/credits/components/PurchaseCreditsModal';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import ModalLayout from '../layouts/ModalLayout';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../utils/format';

const steps = [
  { key: 'objective', label: 'Objective' },
  { key: 'search', label: 'Search Term' },
  { key: 'variations', label: 'Variants' },
  { key: 'competitors', label: 'Competitors' },
  { key: 'demographics', label: 'Demographics' },
  { key: 'preview', label: 'Preview' },
  { key: 'review', label: 'Review' },
];

const initialTestData: TestData = {
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
};

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
  const [testData, setTestData] = useState<TestData>(initialTestData);
  const { currentStep, setCurrentStep, canProceed, handleNext } = useStepValidation(testData);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [demographicsValid, setDemographicsValid] = useState(true);
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

      // Set the correct step
      if (testState.currentStep) {
        setCurrentStep(testState.currentStep);
        setContextStep(testState.currentStep);
      }
    }
  }, [
    testState.isIncompleteTest,
    testState.testData,
    testState.testId,
    testState.currentStep,
    currentTestId,
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
  }, [testData, currentTestId, currentStep, setContextTestId]);

  // Register saveIncompleteTest function with context
  useEffect(() => {
    setSaveIncompleteTest(saveIncompleteTest);
  }, [setSaveIncompleteTest, saveIncompleteTest]);

  // Update context state when local state changes - only when values actually change
  useEffect(() => {
    setContextTestData(testData);
  }, [testData]);

  useEffect(() => {
    setContextStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    setContextTestId(currentTestId);
  }, [currentTestId]);

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
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Validate test data before saving
      if (!testData.name?.trim()) {
        toast.error('Please enter a test name');
        return;
      }

      if (!testData.variations.a) {
        toast.error('Variation A is required');
        return;
      }

      if (testData.competitors.length === 0) {
        toast.error('Please select at least one competitor');
        return;
      }

      if (
        testData.demographics.customScreening.enabled &&
        !testData.demographics.customScreening.valid
      ) {
        toast.error('Please enter and validate your screening question before proceeding');
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
    if (!testData.name?.trim()) {
      toast.error('Please enter a test name');
      return;
    }

    if (!testData.variations.a) {
      toast.error('Variation A is required');
      return;
    }

    if (testData.competitors.length === 0) {
      toast.error('Please select at least one competitor');
      return;
    }

    if (
      testData.demographics.customScreening.enabled &&
      !testData.demographics.customScreening.valid
    ) {
      toast.error('Please enter and validate your screening question before proceeding');
      return;
    }

    const activeVariants = Object.values(testData.variations).filter(v => v !== null).length;
    const totalTesters = testData.demographics.testerCount * activeVariants;

    const hasCustomScreening = testData.demographics.customScreening.enabled && 
      testData.demographics.customScreening.question && 
      testData.demographics.customScreening.validAnswer;
    const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
    const totalCredits = totalTesters * creditsPerTester;
    

    if (creditsLoading) {
      toast.error('Please wait while we load your credit balance...');
      return;
    }
    
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

      // Check if it's an existing incomplete test
      if (testState.isIncompleteTest && currentTestId) {
        try {
          // Update incomplete test to draft and update data
          await testService.updateIncompleteTestToDraft(currentTestId, testData);

          // Proceed with normal launch (create Prolific projects)
          await testService.createProlificProjectsForTest(currentTestId, testData);

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
        setCurrentStep(steps[currentIndex + 1].key);
      }
    }
  };

  // Custom canProceed function that considers demographics validation
  const canProceedWithDemographics = () => {
    if (currentStep === 'demographics') {
      return demographicsValid;
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
    const hasCustomScreening = testData.demographics.customScreening.enabled && 
      testData.demographics.customScreening.question && 
      testData.demographics.customScreening.validAnswer;
    const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
    const totalCredits = totalTesters * creditsPerTester;
    
    // Check if user has sufficient credits
    const availableCredits = creditsData?.total || 0;
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
          canProceed={canProceedWithDemographics()}
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
            <div className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-[#00A67E]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Test Cost</h4>
                    <p className="text-xs text-gray-500">
                      {(() => {
                        const activeVariants = Object.values(publishModal.testData.variations).filter(v => v !== null).length;
                        const totalTesters = publishModal.testData.demographics.testerCount * activeVariants;
                        const hasCustomScreening = publishModal.testData.demographics.customScreening.enabled && 
                          publishModal.testData.demographics.customScreening.question && 
                          publishModal.testData.demographics.customScreening.validAnswer;
                        const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
                        const totalCredits = totalTesters * creditsPerTester;
                        return `${totalTesters} testers × ${creditsPerTester} credit${creditsPerTester !== 1 ? 's' : ''} per tester`;
                      })()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-gray-900">
                    {(() => {
                      const activeVariants = Object.values(publishModal.testData.variations).filter(v => v !== null).length;
                      const totalTesters = publishModal.testData.demographics.testerCount * activeVariants;
                      const hasCustomScreening = publishModal.testData.demographics.customScreening.enabled && 
                        publishModal.testData.demographics.customScreening.question && 
                        publishModal.testData.demographics.customScreening.validAnswer;
                      const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
                      const totalCredits = totalTesters * creditsPerTester;
                      return totalCredits.toFixed(1);
                    })()}
                  </div>
                  <div className="text-xs text-gray-500">Credits</div>
                </div>
              </div>

              {/* Custom Screening Indicator */}
              {publishModal.testData.demographics.customScreening.enabled && 
               publishModal.testData.demographics.customScreening.question && 
               publishModal.testData.demographics.customScreening.validAnswer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">
                      Custom screening enabled (+0.1 credit per tester)
                    </span>
                  </div>
                </div>
              )}
            </div>

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

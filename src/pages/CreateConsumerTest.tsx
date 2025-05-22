import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStepValidation } from '../features/tests/hooks/useStepValidation';
import { testService } from '../features/tests/services/testService';
import { TestCreationSteps } from '../features/tests/components/TestCreationSteps';
import { TestCreationContent } from '../features/tests/components/TestCreationContent';
import { TestData } from '../features/tests/types';

const steps = [
  { key: 'objective', label: 'Objective' },
  { key: 'search', label: 'Search Term' },
  { key: 'competitors', label: 'Competitors' },
  { key: 'variations', label: 'Variations' },
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
  },
};
const LoadingMessages = [
  'Creating your test...',
  'Analyzing demographics...',
  'Setting up your project...',
  'Almost there...',
  'Finalizing details...',
];

export default function CreateConsumerTest() {
  const navigate = useNavigate();
  const [testData, setTestData] = useState<TestData>(initialTestData);
  const { currentStep, setCurrentStep, canProceed, handleNext } = useStepValidation(testData);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const handleBack = () => {
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const handleConfirm = async () => {
    try {
      // Validate test data before submission
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

      setIsLoading(true);

      // Create test
      await testService.createTest(testData);

      toast.success('Test created successfully');
      navigate('/my-tests');
    } catch (error: any) {
      console.error('Test creation error:', error);
      const errorMessage = error.details?.errors?.[0] || error.message || 'Failed to create test';
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
  // Efecto para cambiar los mensajes
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((current: number) =>
          current < LoadingMessages.length - 1 ? current + 1 : current
        );
      }, 4000); // Cambia cada 2 segundos

      return () => {
        clearInterval(interval);
        setLoadingMessageIndex(0); // Reset al cerrar
      };
    }
  }, [isLoading]);

  return (
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
          canProceed={canProceed()}
          onBack={handleBack}
          onNext={handleContinue}
          onConfirm={handleConfirm}
        />
      )}

      <TestCreationContent
        currentStep={currentStep}
        testData={testData}
        onUpdateTestData={setTestData}
        onNext={handleContinue}
        onBack={handleBack}
      />
    </div>
  );
}

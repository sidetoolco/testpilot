import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStepValidation } from '../features/tests/hooks/useStepValidation';
import { testService } from '../features/tests/services/testService';
import { TestCreationSteps } from '../features/tests/components/TestCreationSteps';
import { TestCreationContent } from '../features/tests/components/TestCreationContent';
import { TestData } from '../features/tests/types';

const steps = [
  { key: 'search', label: 'Search Term' },
  { key: 'competitors', label: 'Competitors' },
  { key: 'variations', label: 'Variations' },
  { key: 'demographics', label: 'Demographics' },
  { key: 'preview', label: 'Preview' },
  { key: 'review', label: 'Review' }
];

const initialTestData: TestData = {
  name: '',
  searchTerm: '',
  competitors: [],
  variations: {
    a: null,
    b: null,
    c: null
  },
  demographics: {
    ageRanges: [],
    gender: [],
    locations: [],
    interests: [],
    testerCount: 10
  }
};

export default function CreateConsumerTest() {
  const navigate = useNavigate();
  const [testData, setTestData] = useState<TestData>(initialTestData);
  const { currentStep, setCurrentStep, canProceed, handleNext } = useStepValidation(testData);

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

      // Create test
      await testService.createTest(testData);
      toast.success('Test created successfully');
      navigate('/my-tests');
    } catch (error: any) {
      console.error('Test creation error:', error);
      
      // Show specific error message if available
      const errorMessage = error.details?.errors?.[0] || error.message || 'Failed to create test';
      toast.error(errorMessage);
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

  return (
    <div className="min-h-screen bg-white">
      <TestCreationSteps
        steps={steps}
        currentStep={currentStep}
        canProceed={canProceed()}
        onBack={handleBack}
        onNext={handleContinue}
        onConfirm={handleConfirm}
      />

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
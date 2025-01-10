import React, { useState } from 'react';
import { PlayCircle, X, ArrowLeft, ArrowRight } from 'lucide-react';
import SearchTermEntry from './test-setup/SearchTermEntry';
import CompetitorSelection from './test-setup/CompetitorSelection';
import TestVariations from './test-setup/TestVariations';
import DemographicSelection from './test-setup/DemographicSelection';
import TestReview from './test-setup/TestReview';

interface ConsumerTestSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onTestCreated: (testData: any) => void;
}

type Step = 'search' | 'competitors' | 'variations' | 'demographics' | 'review';

export function ConsumerTestSetup({ isOpen, onClose, onTestCreated }: ConsumerTestSetupProps) {
  const [currentStep, setCurrentStep] = useState<Step>('search');
  const [testData, setTestData] = useState({
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
  });

  if (!isOpen) return null;

  const handleNext = () => {
    const steps: Step[] = ['search', 'competitors', 'variations', 'demographics', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['search', 'competitors', 'variations', 'demographics', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleConfirm = () => {
    onTestCreated(testData);
  };

  const steps = [
    { key: 'search', label: 'Search Term' },
    { key: 'competitors', label: 'Competitors' },
    { key: 'variations', label: 'Variations' },
    { key: 'demographics', label: 'Demographics' },
    { key: 'review', label: 'Review' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const canContinue = () => {
    switch (currentStep) {
      case 'search':
        return testData.searchTerm.trim().length > 0;
      case 'competitors':
        return testData.competitors.length === 11;
      case 'variations':
        return testData.variations.a !== null;
      case 'demographics':
        return testData.demographics.ageRanges.length > 0 && 
               testData.demographics.gender.length > 0 && 
               testData.demographics.locations.length > 0 &&
               testData.demographics.testerCount >= 10;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <PlayCircle className="h-6 w-6 text-primary-400" />
              <h2 className="text-xl font-semibold">Create Consumer Test</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between px-4 mb-6">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      index <= currentStepIndex
                        ? 'bg-primary-400 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`text-sm ${
                    index <= currentStepIndex
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-full mx-4 h-[2px] bg-gray-200 flex-1">
                    <div
                      className={`h-full transition-all ${
                        index < currentStepIndex
                          ? 'bg-primary-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between px-4">
            <button
              onClick={handleBack}
              disabled={isFirstStep}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isFirstStep
                  ? 'opacity-0 cursor-default'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <button
              onClick={isLastStep ? handleConfirm : handleNext}
              disabled={!canContinue()}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                canContinue()
                  ? 'bg-primary-400 text-white hover:bg-primary-500'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{isLastStep ? 'Launch Test' : 'Continue'}</span>
              {!isLastStep && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto">
          {currentStep === 'search' && (
            <SearchTermEntry
              value={testData.searchTerm}
              onChange={(term) => setTestData({ ...testData, searchTerm: term })}
              onNext={handleNext}
            />
          )}

          {currentStep === 'competitors' && (
            <CompetitorSelection
              searchTerm={testData.searchTerm}
              selectedCompetitors={testData.competitors}
              onChange={(competitors) => setTestData({ ...testData, competitors })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'variations' && (
            <TestVariations
              variations={testData.variations}
              onChange={(variations) => setTestData({ ...testData, variations })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'demographics' && (
            <DemographicSelection
              demographics={testData.demographics}
              onChange={(demographics) => setTestData({ ...testData, demographics })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'review' && (
            <TestReview
              testData={testData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
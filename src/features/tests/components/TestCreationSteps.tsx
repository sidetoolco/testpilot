import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Step {
  key: string;
  label: string;
}

interface TestCreationStepsProps {
  steps: Step[];
  currentStep: string;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onConfirm: () => void;
}

export function TestCreationSteps({
  steps,
  currentStep,
  canProceed,
  onBack,
  onNext,
  onConfirm,
}: TestCreationStepsProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;

  return (
    <div className="border-b">
      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index <= currentIndex
                      ? 'bg-primary-400 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm ${
                    index <= currentIndex ? 'text-gray-900 font-medium' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-full mx-4 h-[2px] bg-gray-200 flex-1">
                  <div
                    className={`h-full transition-all ${
                      index < currentIndex ? 'bg-primary-400' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-colors ${
              isFirstStep ? 'opacity-0 cursor-default' : 'border border-gray-200 hover:bg-gray-50'
            }`}
            disabled={isFirstStep}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <button
            onClick={isLastStep ? onConfirm : onNext}
            disabled={!canProceed}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-colors ${
              canProceed
                ? 'bg-primary-400 text-white hover:bg-primary-500'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{isLastStep ? 'Launch Test' : 'Continue'}</span>
            {!isLastStep && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

import SearchTermEntry from '../../../components/test-setup/SearchTermEntry';
import CompetitorSelection from '../../../components/test-setup/CompetitorSelection';
import TestVariations from '../../../components/test-setup/TestVariations';
import DemographicSelection from '../../../components/test-setup/DemographicSelection';
import TestPreview from '../../../components/test-setup/TestPreview';
import TestReview from '../../../components/test-setup/TestReview';
import { TestData } from '../types';

interface TestCreationContentProps {
  currentStep: string;
  testData: TestData;
  onUpdateTestData: (updates: Partial<TestData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TestCreationContent({
  currentStep,
  testData,
  onUpdateTestData,
  onNext,
  onBack
}: TestCreationContentProps) {
  const handleUpdateData = (key: keyof TestData, value: any) => {
    onUpdateTestData({ ...testData, [key]: value });
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      {currentStep === 'search' && (
        <SearchTermEntry
          value={testData.searchTerm}
          onChange={(term) => handleUpdateData('searchTerm', term)}
          onNext={onNext}
        />
      )}

      {currentStep === 'competitors' && (
        <CompetitorSelection
          searchTerm={testData.searchTerm}
          selectedCompetitors={testData.competitors}
          onChange={(competitors) => handleUpdateData('competitors', competitors)}
          onNext={onNext}
          onBack={onBack}
        />
      )}

      {currentStep === 'variations' && (
        <TestVariations
          variations={testData.variations}
          onChange={(variations) => handleUpdateData('variations', variations)}
          onNext={onNext}
          onBack={onBack}
        />
      )}

      {currentStep === 'demographics' && (
        <DemographicSelection
          demographics={testData.demographics}
          variations={testData.variations}
          onChange={(updatedDemographics) => handleUpdateData('demographics', updatedDemographics)}
          onNext={onNext}
          onBack={onBack}
        />
      )}

      {currentStep === 'preview' && (
        <TestPreview
          searchTerm={testData.searchTerm}
          competitors={testData.competitors}
          variations={testData.variations}
          onNext={onNext}
          onBack={onBack}
        />
      )}

      {currentStep === 'review' && (
        <TestReview
          testData={testData}
          onUpdateTestData={onUpdateTestData}
        />
      )}
    </div>
  );
}
import TestVariations from '../../../components/test-setup/TestVariations';
import DemographicSelection from '../../../components/test-setup/DemographicSelection';
import SurveyQuestions from '../../../components/test-setup/SurveyQuestions';
import TestPreview from '../../../components/test-setup/TestPreview';
import TestReview from '../../../components/test-setup/TestReview';
import { TestData } from '../types';
import ObjectiveSelection from '../../../components/test-setup/ObjectiveSelection';
import { useState } from 'react';
import SearchAndCompetitorSelection from '../../../components/test-setup/SearchAndCompetitorSelection';
import SearchTermEntry from '../../../components/test-setup/SearchTermEntry';

interface TestCreationContentProps {
  currentStep: string;
  testData: TestData;
  onUpdateTestData: React.Dispatch<React.SetStateAction<TestData>>;
  onNext: () => void;
  onBack: () => void;
  demographicsValid?: boolean;
  setDemographicsValid?: (valid: boolean) => void;
  surveyQuestionsValid?: boolean;
  setSurveyQuestionsValid?: (valid: boolean) => void;
  expertMode?: boolean;
}

export function TestCreationContent({
  currentStep,
  testData,
  onUpdateTestData,
  onNext,
  onBack,
  demographicsValid,
  setDemographicsValid,
  surveyQuestionsValid,
  setSurveyQuestionsValid,
  expertMode = false,
}: TestCreationContentProps) {
  const handleUpdateData = (key: keyof TestData, value: any) => {
    onUpdateTestData(prevTestData => ({ ...prevTestData, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      {currentStep === 'objective' && (
        <ObjectiveSelection
          onSelect={selectedObjective => {
            handleUpdateData('objective', selectedObjective);
            onNext();
          }}
        />
      )}

      {currentStep === 'variations' && (
        <TestVariations
          variations={testData.variations}
          onChange={variations => handleUpdateData('variations', variations)}
          onNext={onNext}
          onBack={onBack}
          testData={testData}
          onUpdateTestData={onUpdateTestData}
        />
      )}

      {currentStep === 'search-term' && (
        <SearchTermEntry
          value={testData.searchTerm}
          onChange={term => handleUpdateData('searchTerm', term)}
          onNext={onNext}
        />
      )}

      {currentStep === 'search-competitors' && (
        <SearchAndCompetitorSelection
          searchTerm={testData.searchTerm}
          selectedCompetitors={testData.competitors}
          onSearchTermChange={term => handleUpdateData('searchTerm', term)}
          onCompetitorsChange={competitors => handleUpdateData('competitors', competitors)}
        />
      )}

      {currentStep === 'demographics' && (
        <DemographicSelection
          demographics={testData.demographics}
          variations={testData.variations}
          onChange={updater =>
            onUpdateTestData(prevTestData => ({
              ...prevTestData,
              demographics: updater(prevTestData.demographics),
            }))
          }
          onNext={onNext}
          onBack={onBack}
          onValidationChange={setDemographicsValid}
        />
      )}

      {currentStep === 'survey-questions' && expertMode && (
        <SurveyQuestions
          selectedQuestions={testData.surveyQuestions || []}
          onChange={questions =>
            onUpdateTestData(prevTestData => ({
              ...prevTestData,
              surveyQuestions: questions,
            }))
          }
          onValidationChange={setSurveyQuestionsValid}
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
        <TestReview testData={testData} onUpdateTestData={onUpdateTestData} />
      )}
    </div>
  );
}

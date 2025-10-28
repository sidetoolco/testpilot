import TestVariations from '../../../components/test-setup/TestVariations';
import DemographicSelection from '../../../components/test-setup/DemographicSelection';
import SurveyQuestions from '../../../components/test-setup/SurveyQuestions';
import TestPreview from '../../../components/test-setup/TestPreview';
import TestReview from '../../../components/test-setup/TestReview';
import { TestData } from '../types';
import ObjectiveSelection from '../../../components/test-setup/ObjectiveSelection';
import { useState, useEffect } from 'react';
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

// Transition duration constant to match CSS
const TRANSITION_MS = 300; // matches `duration-300`

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayStep, setDisplayStep] = useState(currentStep);

  const handleUpdateData = (key: keyof TestData, value: any) => {
    onUpdateTestData(prevTestData => ({ ...prevTestData, [key]: value }));
  };

  // Handle step transitions with smooth animations
  useEffect(() => {
    if (currentStep !== displayStep) {
      setIsTransitioning(true);
      
      // Wait for fade out animation to complete
      const timer = setTimeout(() => {
        setDisplayStep(currentStep);
        setIsTransitioning(false);
      }, TRANSITION_MS);

      return () => clearTimeout(timer);
    }
  }, [currentStep, displayStep]);

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isTransitioning 
            ? 'opacity-0 transform translate-y-4' 
            : 'opacity-100 transform translate-y-0'
        }`}
      >
        {displayStep === 'objective' && (
          <ObjectiveSelection
            onSelect={selectedObjective => {
              handleUpdateData('objective', selectedObjective);
              onNext();
            }}
          />
        )}

        {displayStep === 'variations' && (
          <TestVariations
            variations={testData.variations}
            onChange={variations => handleUpdateData('variations', variations)}
            onNext={onNext}
            onBack={onBack}
            testData={testData}
            onUpdateTestData={onUpdateTestData}
          />
        )}

        {displayStep === 'search-term' && (
          <SearchTermEntry
            value={testData.searchTerm}
            onChange={term => handleUpdateData('searchTerm', term)}
            onNext={onNext}
            skin={testData.skin}
            onSkinChange={skin => {
              // Clear competitors when skin changes to prevent showing wrong products
              onUpdateTestData(prevTestData => ({
                ...prevTestData,
                skin,
                competitors: []
              }));
            }}
          />
        )}

        {displayStep === 'search-competitors' && (
          <SearchAndCompetitorSelection
            searchTerm={testData.searchTerm}
            selectedCompetitors={testData.competitors}
            onSearchTermChange={term => handleUpdateData('searchTerm', term)}
            onCompetitorsChange={competitors => handleUpdateData('competitors', competitors)}
            skin={testData.skin}
          />
        )}

        {displayStep === 'demographics' && (
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

        {displayStep === 'survey-questions' && expertMode && (
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

        {displayStep === 'preview' && (
          <TestPreview
            searchTerm={testData.searchTerm}
            competitors={testData.competitors}
            variations={testData.variations}
            skin={testData.skin}
          />
        )}

        {displayStep === 'review' && (
          <TestReview testData={testData} onUpdateTestData={onUpdateTestData} />
        )}
      </div>
    </div>
  );
}

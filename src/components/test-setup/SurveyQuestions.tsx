import { useState, useEffect } from 'react';
import { Info, Lock } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import Checkbox from '../ui/Checkbox';
import { AVAILABLE_QUESTIONS, getRequiredQuestions } from '../../features/tests/components/TestQuestions/questionConfig';

export interface Question {
  id: string;
  title: string;
  description: string;
  category: 'rating' | 'text';
  field: string;
  required?: boolean;
}

interface SurveyQuestionsProps {
  selectedQuestions: string[];
  onChange: (questions: string[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function SurveyQuestions({
  selectedQuestions,
  onChange,
  onValidationChange,
}: SurveyQuestionsProps) {
  const [error, setError] = useState<string | null>(null);

  const requiredQuestions = getRequiredQuestions();
  const optionalQuestions = AVAILABLE_QUESTIONS.filter(q => !q.required);

  const handleQuestionToggle = (questionId: string, checked: boolean) => {
    // Don't allow toggling required questions
    if (requiredQuestions.includes(questionId)) {
      return;
    }

    let newSelection: string[];

    if (checked) {
      // Add question if we haven't reached the limit
      if (selectedQuestions.length >= 5) {
        setError('You can only select up to 5 questions.');
        return;
      }
      newSelection = [...selectedQuestions, questionId];
    } else {
      // Remove question
      newSelection = selectedQuestions.filter(id => id !== questionId);
    }

    setError(null);
    onChange(newSelection);
  };

  // Ensure required questions are always selected
  useEffect(() => {
    const hasAllRequired = requiredQuestions.every(q => selectedQuestions.includes(q));
    if (!hasAllRequired) {
      const newSelection = [...new Set([...requiredQuestions, ...selectedQuestions])];
      onChange(newSelection);
    }
  }, [selectedQuestions, requiredQuestions, onChange]);

  const isSelectionValid = selectedQuestions.length === 5;

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isSelectionValid);
    }
  }, [isSelectionValid, onValidationChange]);

  const getQuestionById = (id: string) => AVAILABLE_QUESTIONS.find(q => q.id === id);


  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-semibold text-gray-900 mb-3">Select Survey Questions</h3>
        <p className="text-lg text-gray-500">
          Choose exactly 5 questions that will be asked to test participants.
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong> {selectedQuestions.length}/5 questions
            {selectedQuestions.length < 5 && (
              <span className="block mt-1 text-red-600">
                Please select exactly 5 questions to continue
              </span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - 4 questions (3 required + 1 optional) */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
           Survey Questions
            <Info
              className="h-4 w-4 text-gray-400 cursor-help"
              data-tooltip-id="required-tooltip"
            />
            <Tooltip id="required-tooltip" className="!px-2 !py-1 !text-sm">
              Questions that your users will be asked to answer.
            </Tooltip>
          </h4>
          <div className="space-y-4">
            {/* Required Questions */}
            {requiredQuestions.map(questionId => {
              const question = getQuestionById(questionId);
              if (!question) return null;
              
              return (
                
                <div
                  key={question.id}
                  className="p-4 border border-green-500 bg-green-50 rounded-lg transition-all h-32 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`question-${question.id}`}
                        label={question.title}
                        checked={true}
                        onChange={() => {}} // No-op since it's required
                        disabled={true}
                      />
                      <Lock className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1 ml-6">{question.description}</p>
                  </div>
                  <span className="inline-block ml-6 text-xs text-green-600 font-medium">
                    Required
                  </span>
                </div>
              );
            })}
            
            {/* First Optional Question */}
            
            {optionalQuestions.slice(0, 1).map(question => (
              <div
                key={question.id}
                className={`p-4 border rounded-lg transition-all h-32 flex flex-col justify-between ${
                  selectedQuestions.includes(question.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <Checkbox
                    id={`question-${question.id}`}
                    label={question.title}
                    checked={selectedQuestions.includes(question.id)}
                    onChange={checked => handleQuestionToggle(question.id, checked)}
                  />
                  <p className="text-sm text-gray-600 mt-1 ml-6">{question.description}</p>
                </div>
                <span className="inline-block ml-6 text-xs text-blue-600 font-medium">
                  Optional
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - 4 optional questions */}
        <div>
          <div className="space-y-4 lg:mt-12">
            {optionalQuestions.slice(1).map(question => (
              <div
                key={question.id}
                className={`p-4 border rounded-lg transition-all h-32 flex flex-col justify-between ${
                  selectedQuestions.includes(question.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <Checkbox
                    id={`question-${question.id}`}
                    label={question.title}
                    checked={selectedQuestions.includes(question.id)}
                    onChange={checked => handleQuestionToggle(question.id, checked)}
                  />
                  <p className="text-sm text-gray-600 mt-1 ml-6">{question.description}</p>
                </div>
                <span className="inline-block ml-6 text-xs text-blue-600 font-medium">
                  Optional
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Questions Preview */}
      {selectedQuestions.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Selected Questions Preview</h4>
          <div className="space-y-3">
            {selectedQuestions.map((questionId, index) => {
              const question = getQuestionById(questionId);
              if (!question) return null;
              
              return (
                <div key={questionId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-sm rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900">{question.title}</h5>
                      {question.required && (
                        <Lock className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{question.description}</p>
                    <span className="inline-block mt-1 text-xs text-gray-500">
                      {question.category === 'rating' ? 'Rating Scale (Much Worse to Much Better)' : 'Text Response'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
} 
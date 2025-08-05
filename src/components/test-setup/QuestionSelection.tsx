import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import Checkbox from '../ui/Checkbox';
import { AVAILABLE_QUESTIONS } from '../../features/tests/components/TestQuestions/questionConfig';

export interface Question {
  id: string;
  title: string;
  description: string;
  category: 'rating' | 'text';
  field: string;
  required?: boolean;
}

export interface QuestionSelectionProps {
  selectedQuestions: string[];
  onChange: (questions: string[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// Use the imported questions from questionConfig

export default function QuestionSelection({
  selectedQuestions,
  onChange,
  onValidationChange,
}: QuestionSelectionProps) {
  const [error, setError] = useState<string | null>(null);

  const handleQuestionToggle = (questionId: string, checked: boolean) => {
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

  const isSelectionValid = selectedQuestions.length === 5;

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isSelectionValid);
    }
  }, [isSelectionValid, onValidationChange]);

  const getQuestionById = (id: string) => AVAILABLE_QUESTIONS.find(q => q.id === id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">Select Survey Questions</h3>
        <p className="text-lg text-gray-500">
          Choose exactly 5 questions that will be asked to test participants.
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong> {selectedQuestions.length}/5 questions
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing Questions */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            Standard Questions
            <Info
              className="h-4 w-4 text-gray-400 cursor-help"
              data-tooltip-id="standard-questions-tooltip"
            />
            <Tooltip id="standard-questions-tooltip" className="!px-2 !py-1 !text-sm">
              Core questions that are commonly used in product testing
            </Tooltip>
          </h4>
          <div className="space-y-4">
            {AVAILABLE_QUESTIONS.slice(0, 5).map(question => (
              <div
                key={question.id}
                className={`p-4 border rounded-lg transition-all ${
                  selectedQuestions.includes(question.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Checkbox
                  id={`question-${question.id}`}
                  label={question.title}
                  checked={selectedQuestions.includes(question.id)}
                  onChange={checked => handleQuestionToggle(question.id, checked)}
                />
                <p className="text-sm text-gray-600 mt-1 ml-6">{question.description}</p>
                {question.required && (
                  <span className="inline-block ml-6 mt-1 text-xs text-blue-600 font-medium">
                    Recommended
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* New Questions */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            Additional Questions
            <Info
              className="h-4 w-4 text-gray-400 cursor-help"
              data-tooltip-id="additional-questions-tooltip"
            />
            <Tooltip id="additional-questions-tooltip" className="!px-2 !py-1 !text-sm">
              Specialized questions for deeper product insights
            </Tooltip>
          </h4>
          <div className="space-y-4">
            {AVAILABLE_QUESTIONS.slice(5).map(question => (
              <div
                key={question.id}
                className={`p-4 border rounded-lg transition-all ${
                  selectedQuestions.includes(question.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Checkbox
                  id={`question-${question.id}`}
                  label={question.title}
                  checked={selectedQuestions.includes(question.id)}
                  onChange={checked => handleQuestionToggle(question.id, checked)}
                />
                <p className="text-sm text-gray-600 mt-1 ml-6">{question.description}</p>
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
                    <h5 className="font-medium text-gray-900">{question.title}</h5>
                    <p className="text-sm text-gray-600">{question.description}</p>
                    <span className="inline-block mt-1 text-xs text-gray-500">
                      {question.category === 'rating' ? 'Rating Scale (1-5)' : 'Text Response'}
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
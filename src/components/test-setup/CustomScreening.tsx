import { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Info, Eye } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { CustomScreening as CustomScreeningInterface } from '../../features/tests/types';
import apiClient from '../../lib/api';

interface ValidateQuestionResponse {
  isValid: boolean;
  error?: string;
  suggestedQuestion?: string;
}

interface CustomScreeningProps {
  onChange: (field: keyof CustomScreeningInterface, value: any) => void;
  value: CustomScreeningInterface;
}

export default function CustomScreening({ onChange, value }: CustomScreeningProps) {
  const [error, setError] = useState<string | null>(null);
  // const [suggestedQuestion, setSuggestedQuestion] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const validateQuestion = (question: string, desiredAnswer?: string) => {
    if (!question.trim()) {
      setError('Please enter a screening question');
      onChange('valid', false);
      return false;
    }

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set loading state immediately
    setIsValidating(true);
    onChange('isValidating', true);

    apiClient
      .post<ValidateQuestionResponse>('/screening/validate-question', {
        question,
        desiredAnswer: desiredAnswer || 'Yes',
      })
      .then(({ data }) => {
        if (!data.isValid || data.error) {
          setError(
            data.error ||
              'This question may be too narrow and could limit participant availability.'
          );
          onChange('valid', false);
          // if (data.suggestedQuestion) {
          //   setSuggestedQuestion(data.suggestedQuestion);
          // }
        } else {
          onChange('valid', true);
          setError(null);
        }
      })
      .catch(err => {
        setError(
          err.response?.data?.message || 'Something unexpected happened. Please, try again later'
        );
        onChange('valid', false);
      })
      .finally(() => {
        setIsValidating(false);
        onChange('isValidating', false);
      });
  };

  // Remove the automatic validation effect
  // useEffect(() => {
  //   if (value.enabled && value.question && value.validAnswer) {
  //     validateQuestion(value.question, value.validAnswer);
  //   } else if (value.enabled && value.question && !value.validAnswer) {
  //     // If we have a question but no answer, clear validation state
  //     setIsValidating(false);
  //     onChange('isValidating', false);
  //     setError(null);
  //     onChange('valid', false);
  //   }
  // }, [value.validAnswer, value.enabled]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (value.enabled && componentRef.current) {
      setTimeout(() => {
        const element = componentRef.current;
        if (element) {
          const elementTop = element.offsetTop;
          const windowHeight = window.innerHeight;
          const elementHeight = element.offsetHeight;

          const scrollPosition = Math.max(0, elementTop - 20);

          const currentScroll = window.pageYOffset;
          const isElementVisible =
            currentScroll <= scrollPosition &&
            currentScroll + windowHeight >= elementTop + elementHeight;

          if (!isElementVisible) {
            window.scrollTo({
              top: scrollPosition,
              behavior: 'smooth',
            });
          }
        }
      }, 100);
    }
  }, [value.enabled]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuestion = e.target.value;
    onChange('question', newQuestion);
    setError(null);
    // setSuggestedQuestion(null);
    // Clear validation when question changes
    onChange('valid', false);
  };

  // const useSuggestedQuestion = () => {
  //   if (suggestedQuestion) {
  //     onChange('question', suggestedQuestion);
  //   }
  // };

  const handleCheckAvailability = () => {
    if (value.question) {
      validateQuestion(value.question, value.validAnswer);
    }
  };

  return (
    <div ref={componentRef}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          Custom Screening
          <Info
            className="h-4 w-4 text-gray-400 cursor-help"
            data-tooltip-id="custom-screening-tooltip"
          />
          <Tooltip id="custom-screening-tooltip" className="!px-2 !py-1 !text-sm">
            Add a Yes/No question to screen participants
          </Tooltip>
        </h4>
        <button
          onClick={() => onChange('enabled', !value.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:ring-offset-2 ${
            value.enabled ? 'bg-[#00A67E]' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {value.enabled && (
        <div className="space-y-6">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg space-y-4">
            <div>
              <h5 className="font-medium text-green-800 mb-2">
                Need a specific kind of tester? Add one Yes/No question.
              </h5>
              <p className="text-sm text-green-800">
                Type your question — e.g. "Do you own a dog?"
                <br />
                Choose which answer you want to keep (Yes or No).
                <br />
                Testers who give the other answer are screened out.
              </p>
            </div>

            <div>
              <h5 className="font-medium text-green-800 mb-2">Tips</h5>
              <ul className="text-sm text-green-800 space-y-1 list-disc pl-4">
                <li>Keep questions simple and factual (pet ownership, diet, product use).</li>
                <li>
                  Avoid questions so narrow that fewer than about 5% of testers qualify — your study
                  may stall.
                </li>
                <li>When unsure, start broad ("pet owners") and narrow later.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Screening Question
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={value.question || ''}
                    onChange={handleQuestionChange}
                    placeholder="e.g., Do you use cleaning products regularly?"
                    className={`w-full px-4 py-3 border ${
                      error
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : value.valid && !isValidating
                          ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                          : 'border-gray-300 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]'
                    } rounded-xl transition-all`}
                  />
                  {value.valid && !isValidating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCheckAvailability}
                  disabled={!value.question?.trim() || isValidating}
                  className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    !value.question?.trim() || isValidating
                      ? 'border-gray-200 bg-primary-50 text-gray-400 cursor-not-allowed'
                      : 'border-[#00A67E] bg-[#00A67E] text-white hover:bg-[#00A67E]/90'
                  }`}
                >
                  {isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>Check Availability</span>
                    </>
                  )}
                </button>
              </div>
              {error && (
                <div className="flex items-start space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-px" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keep testers who answer
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map(option => (
                  <button
                    key={option}
                    onClick={() => onChange('validAnswer', option as 'Yes' | 'No')}
                    disabled={!value.valid}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      !value.valid
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : value.validAnswer === option
                          ? 'border-[#00A67E] bg-[#00A67E]/5'
                          : 'border-gray-200 hover:border-[#00A67E]/30'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {!value.valid && value.question && (
                <p className="text-sm text-gray-500 mt-2">
                  Please check availability first before selecting an answer
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

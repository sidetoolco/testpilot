import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { CustomScreening as CustomScreeningInterface } from '../../features/tests/types';
import apiClient from '../../lib/api';

interface CustomScreeningProps {
  onChange: (field: keyof CustomScreeningInterface, value: any) => void;
  value: CustomScreeningInterface;
}

export default function CustomScreening({ onChange, value }: CustomScreeningProps) {
  const [error, setError] = useState<string | null>(null);

  const validateQuestion = (question: string) => {
    if (!question.trim()) {
      setError('Please enter a screening question');
      return false;
    }

    onChange('isValidating', true);

    apiClient
      .post<{ isValid: boolean; error?: string }>('/screening/validate-question', {
        question,
      })
      .then(({ data }) => {
        if (!data.isValid || data.error) {
          setError(
            data.error ||
              'This question may be too narrow and could limit participant availability.'
          );
          onChange('valid', false);
        } else {
          onChange('valid', true);
          setError(null);
        }
      })
      .catch(err => {
        setError(
          err.response?.data?.message || 'Something unexpected happened. Please, try again later'
        );
      })
      .finally(() => onChange('isValidating', false));
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuestion = e.target.value;
    onChange('question', newQuestion);
    setError(null); // Clear error on new input
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">Custom Screening</h4>
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

            <div className="pt-2 border-t border-green-200">
              <p className="text-sm font-medium text-green-800">
                Custom screening adds a flat $6 to cover extra recruiting cost.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Screening Question
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={value.question || ''}
                  onChange={handleQuestionChange}
                  onBlur={() => validateQuestion(value.question || '')}
                  placeholder="e.g., Do you use cleaning products regularly?"
                  className={`w-full px-4 py-3 border ${
                    error
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : value.valid && !value.isValidating
                        ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]'
                  } rounded-xl transition-all`}
                />
                {value.isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00A67E]"></div>
                  </div>
                )}
                {value.valid && !value.isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {error && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
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
                    className={`p-4 rounded-xl border-2 transition-all ${
                      value.validAnswer === option
                        ? 'border-[#00A67E] bg-[#00A67E]/5'
                        : 'border-gray-200 hover:border-[#00A67E]/30'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

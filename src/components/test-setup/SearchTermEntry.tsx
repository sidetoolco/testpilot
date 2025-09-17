import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import ExperienceSelection from './ExperienceSelection';

interface SearchTermEntryProps {
  value: string;
  onChange: (term: string) => void;
  onNext: () => void;
  skin: 'amazon' | 'walmart';
  onSkinChange: (skin: 'amazon' | 'walmart') => void;
}

const defaultSuggestions = [
  'Fabric Softener',
  'Laundry Detergent',
  'Dish Soap',
  'All-Purpose Cleaner',
  'Air Freshener',
  'Bathroom Cleaner',
];

export default function SearchTermEntry({ value, onChange, onNext, skin, onSkinChange }: SearchTermEntryProps) {
  const allSuggestions = useMemo(() => {
    return defaultSuggestions;
  }, []);

  const isExactMatch = allSuggestions.some(
    suggestion => suggestion.toLowerCase() === value.toLowerCase()
  );

  const filteredSuggestions =
    value.trim() && !isExactMatch
      ? allSuggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        )
      : [];

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
  };

  const handleContinue = () => {
    if (value.trim() && skin) {
      onNext();
    }
  };

  const canContinue = value.trim().length > 0 && !!skin;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-semibold text-gray-900 mb-3">
          Which search term defines your competitive set?
        </h3>
        <p className="text-lg text-gray-500">
          Enter the search term that shoppers would use to find your product category. This helps us
          identify the right competitive set for your test.
        </p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && canContinue) {
                  handleContinue();
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors"
              placeholder="e.g., 'Fabric Softener'"
            />
          </div>

          {/* This part remains the same and just works */}
          {filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Experience Selection */}
        <ExperienceSelection
          selectedExperience={skin}
          onExperienceChange={onSkinChange}
        />
      </div>
    </div>
  );
}
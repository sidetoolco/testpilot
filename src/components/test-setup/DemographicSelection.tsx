import React, { useState, useEffect } from 'react';
import { Users, Calculator } from 'lucide-react';
import { PriceCalculator } from './PriceCalculator';

interface DemographicSelectionProps {
  demographics: {
    ageRanges: string[];
    gender: string[];
    locations: string[];
    interests: string[];
    testerCount: number;
  };
  variations: {
    a: any;
    b: any;
    c: any;
  };
  onChange: (demographics: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DemographicSelection({
  demographics,
  variations,
  onChange,
}: DemographicSelectionProps) {
  const [testerCount, setTesterCount] = useState<number | ''>(10); // Valor inicial
  const [error, setError] = useState<string | null>(null); // Estado para el error

  const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
  const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const countries = ['United States', 'Canada'];
  const screeningCriteria = [
    'Eco Conscious',
    'Value Shopper',
    'Family with Young Children',
    'Family with Pets',
    'Bulk Shopper',
    'Tech Savvy'
  ];

  // Calculate number of active variants
  const activeVariantCount = Object.values(variations).filter(v => v !== null).length;

  // Set default values on component mount
  useEffect(() => {
    const updates: Partial<typeof demographics> = {};
    
    if (!demographics.locations?.length) {
      updates.locations = ['United States', 'Canada'];
    }
    
    if (!demographics.testerCount) {
      updates.testerCount = 10;
    }

    if (Object.keys(updates).length > 0) {
      onChange({ ...demographics, ...updates });
    }
  }, []);

  const handleAgeSelect = (age: string) => {
    const newAges = demographics.ageRanges.includes(age)
      ? demographics.ageRanges.filter(a => a !== age)
      : [...demographics.ageRanges, age];
    onChange({ ...demographics, ageRanges: newAges });
  };

  const handleGenderSelect = (gender: string) => {
    const newGenders = demographics.gender.includes(gender)
      ? demographics.gender.filter(g => g !== gender)
      : [...demographics.gender, gender];
    onChange({ ...demographics, gender: newGenders });
  };

  const handleCountrySelect = (country: string) => {
    const newLocations = demographics.locations.includes(country)
      ? demographics.locations.filter(l => l !== country)
      : [...demographics.locations, country];
    onChange({ ...demographics, locations: newLocations });
  };

  const handleScreeningSelect = (criterion: string) => {
    const newScreening = demographics.interests.includes(criterion)
      ? demographics.interests.filter(i => i !== criterion)
      : [...demographics.interests, criterion];
    onChange({ ...demographics, interests: newScreening });
  };

  const handleTesterCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10); // Convertir a número
    setTesterCount(isNaN(value) ? '' : value); // Permitir borrar el campo

    if (isNaN(value) || value < 10 || value > 500) {
      setError('Please enter a number between 10 and 500.');
    } else {
      setError(null); // No hay error
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-semibold text-gray-900 mb-3">
          Select Target Demographics
        </h3>
        <p className="text-lg text-gray-500">
          Choose the demographic criteria for your test participants.
        </p>
      </div>

      <div className="space-y-8">
        {/* Price Calculator */}
        <PriceCalculator
          testerCount={demographics.testerCount}
          variantCount={activeVariantCount}
        />

        {/* Number of Testers per Variant */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4"># of Testers per Variant</h4>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-xs">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="testerCount"
                type="number"
                min="10"
                max="500"
                value={testerCount}
                onChange={handleTesterCountChange}
                className={`w-full pl-10 pr-4 py-3 border ${error
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]'
                  } rounded-xl transition-all`}
                placeholder="Number of testers"
              />
            </div>
            <span className="text-sm text-gray-500">
              Min: 10, Max: 500 testers
            </span>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1 sm:mt-2 md:mt-3 lg:mt-1">
              {error}
            </p>
          )}
        </div>

        {/* Rest of the demographic options... */}
        {/* Age Ranges */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Age Ranges</h4>
          <div className="grid grid-cols-3 gap-3">
            {ageRanges.map((age) => (
              <button
                key={age}
                onClick={() => handleAgeSelect(age)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  demographics.ageRanges.includes(age)
                    ? 'border-[#00A67E] bg-[#00A67E]/5'
                    : 'border-gray-200 hover:border-[#00A67E]/30'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Gender</h4>
          <div className="grid grid-cols-2 gap-3">
            {genders.map((gender) => (
              <button
                key={gender}
                onClick={() => handleGenderSelect(gender)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  demographics.gender.includes(gender)
                    ? 'border-[#00A67E] bg-[#00A67E]/5'
                    : 'border-gray-200 hover:border-[#00A67E]/30'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Country */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Country</h4>
          <div className="grid grid-cols-2 gap-3">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => handleCountrySelect(country)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  demographics.locations.includes(country)
                    ? 'border-[#00A67E] bg-[#00A67E]/5'
                    : 'border-gray-200 hover:border-[#00A67E]/30'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Screening Criteria */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Screening Criteria</h4>
          <div className="grid grid-cols-2 gap-3">
            {screeningCriteria.map((criterion) => (
              <button
                key={criterion}
                onClick={() => handleScreeningSelect(criterion)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  demographics.interests.includes(criterion)
                    ? 'border-[#00A67E] bg-[#00A67E]/5'
                    : 'border-gray-200 hover:border-[#00A67E]/30'
                }`}
              >
                {criterion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
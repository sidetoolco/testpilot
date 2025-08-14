import { useState, useEffect, useCallback } from 'react';
import { Users, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip } from 'react-tooltip';
import { PriceCalculator } from './PriceCalculator';
import CustomScreening from './CustomScreening';
import { CustomScreening as CustomScreeningType } from '../../features/tests/types';
import Checkbox from '../ui/Checkbox';

type Demographics = {
  ageRanges: string[];
  gender: string[];
  locations: string[];
  interests: string[];
  testerCount: number;
  customScreening: CustomScreeningType;
};

interface DemographicSelectionProps {
  demographics: Demographics;
  variations: {
    a: any;
    b: any;
    c: any;
  };
  onChange: (updater: (prev: Demographics) => Demographics) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export default function DemographicSelection({
  demographics,
  variations,
  onChange,
  onValidationChange,
}: DemographicSelectionProps) {
  const activeVariantCount = Object.values(variations).filter(v => v !== null).length;

  const [testerCount, setTesterCount] = useState<string>(
    (demographics.testerCount || 25).toString()
  );
  const [error, setError] = useState<string | null>(null);

  const initialMinAge =
    demographics.ageRanges?.length >= 2 ? demographics.ageRanges[0] : '18';
  const initialMaxAge =
    demographics.ageRanges?.length >= 2 ? demographics.ageRanges[1] : '55';

  // CHANGED: State is now string to allow for empty inputs
  const [minAge, setMinAge] = useState<string>(initialMinAge);
  const [maxAge, setMaxAge] = useState<string>(initialMaxAge);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [ageBlankError, setAgeBlankError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const genders = ['Male', 'Female'];
  const countries = ['US', 'CA'];


  const isTesterCountValid = useCallback(() => {
    if (testerCount === '') return false;
    const parsedValue = parseInt(testerCount);
    return !isNaN(parsedValue) && parsedValue >= 25 && parsedValue <= 500;
  }, [testerCount]);


  const isDemographicsValid = useCallback(() => {
    const hasValidTesterCount = isTesterCountValid();
    const hasValidGender = demographics.gender.length > 0;
    const hasValidLocations = demographics.locations.length > 0;
    
    // Age validation - ensure both local state and demographics object are valid and consistent
    const hasValidAgeInputs = minAge !== '' && maxAge !== '' && !ageError && !ageBlankError;
    const hasValidAgeRanges = demographics.ageRanges.length === 2 && 
      !isNaN(parseInt(demographics.ageRanges[0])) && 
      !isNaN(parseInt(demographics.ageRanges[1]));
    
    // Ensure local state and demographics object are consistent
    const hasConsistentAgeData = hasValidAgeRanges && 
      demographics.ageRanges[0] === minAge && 
      demographics.ageRanges[1] === maxAge;
    
    const hasValidCustomScreening = !demographics.customScreening?.enabled || 
      (!!demographics.customScreening.question?.trim() && 
       (demographics.customScreening.validAnswer === 'Yes' || demographics.customScreening.validAnswer === 'No') &&
       !demographics.customScreening.isValidating);
    
    return isInitialized && hasValidTesterCount && hasValidGender && hasValidLocations && 
           hasValidAgeInputs && hasValidAgeRanges && hasConsistentAgeData && 
           hasValidCustomScreening;
  }, [isTesterCountValid, demographics, ageError, ageBlankError, minAge, maxAge, isInitialized]);

  // Notify parent of validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isDemographicsValid());
    }
  }, [isDemographicsValid, onValidationChange]);

  // Initialize default values immediately if they're missing
  useEffect(() => {
    const updates: Partial<typeof demographics> = {};

    if (!demographics.locations?.length) {
      updates.locations = ['US', 'CA'];
    }
    if (!demographics.gender?.length) {
      updates.gender = ['Male', 'Female'];
    }
    // Fix: Initialize age ranges with default values if they're empty
    if (!demographics.ageRanges?.length) {
      updates.ageRanges = [initialMinAge, initialMaxAge];
    }
    


    if (Object.keys(updates).length > 0) {
      onChange(prev => ({ ...prev, ...updates }));
    }
    
    // Mark as initialized after setting up defaults
    setIsInitialized(true);
  }, []); // Run only once on mount 
  
  useEffect(() => {
    if (demographics.testerCount !== parseInt(testerCount)) {
      setTesterCount((demographics.testerCount || 25).toString());
    }
    if (demographics.ageRanges?.length >= 2) {
      const [newMinAge, newMaxAge] = demographics.ageRanges;
      if (newMinAge !== minAge) setMinAge(newMinAge);
      if (newMaxAge !== maxAge) setMaxAge(newMaxAge);
    }
  }, [demographics.testerCount, demographics.ageRanges]);


  const handleAgeChange = (type: 'min' | 'max', value: string) => {
    let newMinStr = minAge;
    let newMaxStr = maxAge;

    if (type === 'min') {
      setMinAge(value);
      newMinStr = value;
    } else {
      setMaxAge(value);
      newMaxStr = value;
    }

    if (newMinStr === '' || newMaxStr === '') {
      setAgeError(null);
      setAgeBlankError('Please enter both minimum and maximum age.');
      return;
    }

    setAgeBlankError(null);

    const numMin = parseInt(newMinStr);
    const numMax = parseInt(newMaxStr);

    if (!isNaN(numMin) && !isNaN(numMax)) {
      if (numMin > numMax) {
        setAgeError('Minimum age cannot be greater than maximum age.');
      } else {
        setAgeError(null);
        onChange(prev => ({ ...prev, ageRanges: [newMinStr, newMaxStr] }));
      }
    } else {
      setAgeError('Please enter valid numeric ages.');
    }
  };

  const handleGenderSelect = (gender: string, checked: boolean) => {
    const newGenders = checked
      ? [...demographics.gender, gender]
      : demographics.gender.filter(g => g !== gender);
    onChange(prev => ({ ...prev, gender: newGenders }));
  };

  const handleCountrySelect = (country: string, checked: boolean) => {
    const newLocations = checked
      ? [...demographics.locations, country]
      : demographics.locations.filter(l => l !== country);
    onChange(prev => ({ ...prev, locations: newLocations }));
  };

  const handleTesterCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTesterCount(value);

    if (value === '') {
      setError(null);
      return;
    }

    const parsedValue = parseInt(value);

    if (isNaN(parsedValue) || parsedValue < 25 || parsedValue > 500) {
      setError('Please enter a number between 25 and 500.');
    } else {
      setError(null);
      onChange(prev => ({ ...prev, testerCount: parsedValue }));
    }
  };
  
  const numericTesterCount = parseInt(testerCount) || 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-semibold text-gray-900 mb-3">Select Target Demographics</h3>
        <p className="text-lg text-gray-500">
          Choose the demographic criteria for your test participants.
        </p>
      </div>

      <div className="space-y-8">
        {/* Price Calculator */}
        {/* CHANGED: Pass parsed numeric value and custom screening state */}
        <PriceCalculator 
          testerCount={numericTesterCount} 
          variantCount={activeVariantCount} 
          hasCustomScreening={demographics.customScreening?.enabled}
        />
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Warning: Applying too many filters may limit the number of available shoppers and
            increase the time needed to complete your study. Consider selecting only the most
            essential criteria.
          </p>
        </div>

        {/* Number of Testers per Variant */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            # of Testers per Variant <span className="text-red-500">*</span>
            <Info
              className="h-4 w-4 text-gray-400 cursor-help"
              data-tooltip-id="tester-count-tooltip"
            />
            <Tooltip id="tester-count-tooltip" className="!px-2 !py-1 !text-sm">
              Number of testers per variation from 25 to 500
            </Tooltip>
          </h4>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-xs">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="testerCount"
                min="25"
                max="500"
                type="number"
               
                value={testerCount}
                onChange={handleTesterCountChange}
                className={`w-full pl-10 pr-4 py-3 border ${
                  error
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]'
                } rounded-xl transition-all`}
                placeholder="Number of testers"
              />
            </div>
            <span className="text-sm text-gray-500">Min: 25, Max: 500 testers</span>
          </div>
          {error && <p className="text-red-500 text-sm mt-1 sm:mt-2 md:mt-3 lg:mt-1">{error}</p>}
        </div>

        {/* Age Range Inputs */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            Age Range <span className="text-red-500">*</span>
            <Info
              className="h-4 w-4 text-gray-400 cursor-help"
              data-tooltip-id="age-range-tooltip"
            />
            <Tooltip id="age-range-tooltip" className="!px-2 !py-1 !text-sm">
              Age range for participants
            </Tooltip>
          </h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Age</label>
              <input
                type="number"
                value={minAge}
                onChange={e => handleAgeChange('min', e.target.value)}
                className={`w-full px-4 py-3 border ${
                  ageError || ageBlankError
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]'
                } rounded-xl transition-all`}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Age</label>
              <input
                type="number"
                min="18"
                max="100"
                // CHANGED: Value is now the string state
                value={maxAge}
                onChange={e => handleAgeChange('max', e.target.value)}
                className={`w-full px-4 py-3 border ${
                  ageError || ageBlankError
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]'
                } rounded-xl transition-all`}
              />
            </div>
          </div>
          {ageError && <p className="text-red-500 text-sm mt-1">{ageError}</p>}
          {ageBlankError && <p className="text-red-500 text-sm mt-1">{ageBlankError}</p>}
        </div>

        {/* Gender and Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gender */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              Gender <span className="text-red-500">*</span>
              <Info
                className="h-4 w-4 text-gray-400 cursor-help"
                data-tooltip-id="gender-tooltip"
              />
              <Tooltip id="gender-tooltip" className="!px-2 !py-1 !text-sm">
                Select at least one participant gender
              </Tooltip>
            </h4>
            <div className="space-y-3">
              {genders.map(gender => (
                <Checkbox
                  key={gender}
                  id={`gender-${gender.toLowerCase()}`}
                  label={gender}
                  checked={demographics.gender.includes(gender)}
                  onChange={checked => handleGenderSelect(gender, checked)}
                />
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              Country <span className="text-red-500">*</span>
              <Info
                className="h-4 w-4 text-gray-400 cursor-help"
                data-tooltip-id="country-tooltip"
              />
              <Tooltip id="country-tooltip" className="!px-2 !py-1 !text-sm">
                Select at least one participant location
              </Tooltip>
            </h4>
            <div className="space-y-3">
              {countries.map(country => (
                <Checkbox
                  key={country}
                  id={`country-${country.toLowerCase()}`}
                  label={country}
                  checked={demographics.locations.includes(country)}
                  onChange={checked => handleCountrySelect(country, checked)}
                />
              ))}
            </div>
          </div>
        </div>

        <CustomScreening
          value={demographics.customScreening}
          onChange={(field, value) =>
            onChange(prevDemographics => ({
              ...prevDemographics,
              customScreening: {
                ...prevDemographics.customScreening,
                [field]: value,
              },
            }))
          }
        />

      </div>
    </div>
  );
}
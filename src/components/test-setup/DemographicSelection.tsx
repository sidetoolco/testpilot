import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { PriceCalculator } from "./PriceCalculator";
import CustomScreening from "./CustomScreening";
import { CustomScreening as CustomScreeningType } from "../../features/tests/types";

interface DemographicSelectionProps {
  demographics: {
    ageRanges: string[];
    gender: string[];
    locations: string[];
    interests: string[];
    testerCount: number;
    customScreening: CustomScreeningType;
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
  const [testerCount, setTesterCount] = useState<number>(25);
  const [error, setError] = useState<string | null>(null);
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(55);
  const [ageError, setAgeError] = useState<string | null>(null);

  const genders = ["Male", "Female"];
  const countries = ["US", "CA"];

  // const screeningCriteria = [
  //   "Health & Fitness",
  //   "Actively Religious",
  //   "Environmentally Conscious",
  //   "College Graduate",
  //   "Military Veteran",
  //   "Lower Income"
  // ];

  // Calculate number of active variants
  const activeVariantCount = Object.values(variations).filter(
    (v) => v !== null
  ).length;

  // Set default values on component mount
  useEffect(() => {
    const updates: Partial<typeof demographics> = {};

    if (!demographics.locations?.length) {
      updates.locations = ["US", "CA"];
    }

    if (!demographics.gender?.length) {
      updates.gender = ["Male", "Female"];
    }

    if (!demographics.ageRanges?.length) {
      updates.ageRanges = [minAge.toString(), maxAge.toString()];
    }

    if (Object.keys(updates).length > 0) {
      onChange({ ...demographics, ...updates });
    }
  }, []);

  const handleAgeChange = (type: "min" | "max", value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    let newMinAge = minAge;
    let newMaxAge = maxAge;

    if (type === "min") {
      newMinAge = numValue;
      if (numValue > maxAge) {
        setAgeError("Minimum age cannot be greater than maximum age");
      } else {
        setAgeError(null);
      }
    } else {
      newMaxAge = numValue;
      if (numValue < minAge) {
        setAgeError("Maximum age cannot be less than minimum age");
      } else {
        setAgeError(null);
      }
    }

    setMinAge(newMinAge);
    setMaxAge(newMaxAge);

    // Update the ageRanges array with the new range
    onChange({ ...demographics, ageRanges: [newMinAge, newMaxAge] });
  };

  const handleGenderSelect = (gender: string) => {
    const newGenders = demographics.gender.includes(gender)
      ? demographics.gender.filter((g) => g !== gender)
      : [...demographics.gender, gender];
    onChange({ ...demographics, gender: newGenders });
  };

  const handleCountrySelect = (country: string) => {
    const newLocations = demographics.locations.includes(country)
      ? demographics.locations.filter((l) => l !== country)
      : [...demographics.locations, country];
    onChange({ ...demographics, locations: newLocations });
  };

  // const handleScreeningSelect = (criterion: string) => {
  //   const newScreening = demographics.interests.includes(criterion)
  //     ? demographics.interests.filter(i => i !== criterion)
  //     : [...demographics.interests, criterion];
  //   onChange({ ...demographics, interests: newScreening });
  // };

  const handleTesterCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Cambiado para permitir valor vacío

    if (value === "") {
      setTesterCount(0);
      return;
    }
    const parsedValue = parseInt(value);

    if (isNaN(parsedValue) || parsedValue < 25 || parsedValue > 500) {
      setError("Please enter a number between 25 and 500.");
    } else {
      setError(null);
    }
    if (!isNaN(parsedValue)) {
      const updatedDemographics = { ...demographics, testerCount: parsedValue };
      onChange(updatedDemographics);
      setTesterCount(parsedValue);
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
          testerCount={testerCount}
          variantCount={activeVariantCount}
        />
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Warning: Applying too many filters may limit the number of
            available shoppers and increase the time needed to complete your
            study. Consider selecting only the most essential criteria.
          </p>
        </div>
        {/* Number of Testers per Variant */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            # of Testers per Variant
          </h4>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-xs">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="testerCount"
                type="number"
                min="25"
                max="500"
                value={testerCount || ""}
                onChange={handleTesterCountChange}
                className={`w-full pl-10 pr-4 py-3 border ${
                  error
                    ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                } rounded-xl transition-all`}
                placeholder="Number of testers"
              />
            </div>
            <span className="text-sm text-gray-500">
              Min: 25, Max: 500 testers
            </span>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1 sm:mt-2 md:mt-3 lg:mt-1">
              {error}
            </p>
          )}
        </div>

        {/* Age Range Inputs */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Age Range</h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={minAge}
                onChange={(e) => handleAgeChange("min", e.target.value)}
                className={`w-full px-4 py-3 border ${
                  ageError
                    ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                } rounded-xl transition-all`}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={maxAge}
                onChange={(e) => handleAgeChange("max", e.target.value)}
                className={`w-full px-4 py-3 border ${
                  ageError
                    ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                } rounded-xl transition-all`}
              />
            </div>
          </div>
          {ageError && <p className="text-red-500 text-sm mt-1">{ageError}</p>}
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
                    ? "border-[#00A67E] bg-[#00A67E]/5"
                    : "border-gray-200 hover:border-[#00A67E]/30"
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
                    ? "border-[#00A67E] bg-[#00A67E]/5"
                    : "border-gray-200 hover:border-[#00A67E]/30"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Screening Criteria */}
        {/* <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Screening Criteria</h4>
          <div className="grid grid-cols-2 gap-3">
            {screeningCriteria.map((criterion) => (
              <button
                key={criterion}
                onClick={() => handleScreeningSelect(criterion)}
                className={`p-4 rounded-xl border-2 transition-all ${demographics.interests.includes(criterion)
                  ? 'border-[#00A67E] bg-[#00A67E]/5'
                  : 'border-gray-200 hover:border-[#00A67E]/30'
                  }`}
              >
                {criterion}
              </button>
            ))}
          </div>
        </div> */}

        <CustomScreening
          value={demographics.customScreening}
          onChange={(customScreeningPayload) =>
            onChange({
              ...demographics,
              customScreening: customScreeningPayload,
            })
          }
        />
      </div>
    </div>
  );
}

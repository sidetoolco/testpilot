import { useState, useEffect } from 'react';
import { TestData } from '../../features/tests/types';

interface TestReviewProps {
  testData: TestData;
  onUpdateTestData: React.Dispatch<React.SetStateAction<TestData>>;
}

export default function TestReview({ testData, onUpdateTestData }: TestReviewProps) {
  const [testName, setTestName] = useState(testData.name);

  useEffect(() => {
    setTestName(testData.name);
  }, [testData.name]);

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setTestName(newName);
    onUpdateTestData({ ...testData, name: newName });
  };

  const activeVariants = Object.values(testData.variations).filter(v => v !== null).length;
  const totalTesters = testData.demographics.testerCount * activeVariants;
  const costPerTester = 49;
  const totalCost = totalTesters * costPerTester;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-semibold text-gray-900 mb-3">Review Your Test</h3>
        <p className="text-lg text-gray-500">
          Review and confirm your test configuration before launching.
        </p>
      </div>

      <div className="space-y-8">
        {/* Test Title */}
        <div>
          <label htmlFor="testTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Test Title
          </label>
          <input
            id="testTitle"
            type="text"
            value={testName}
            onChange={handleNameChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors"
            placeholder="Enter a descriptive title for your test"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            A clear title helps you identify and manage your tests
          </p>
        </div>

        {/* Cost Summary */}
        <div className="bg-[#1B1B31] text-white rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">US$</span>
              </div>
              <div>
                <h4 className="text-xl font-medium">Total Cost</h4>
                <p className="text-sm text-gray-400">
                  Based on {totalTesters} testers at ${costPerTester} per tester
                </p>
              </div>
            </div>
            <div className="text-3xl font-semibold">${totalCost.toLocaleString()}</div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-semibold mb-6">Test Configuration</h4>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Search Term</div>
                <div className="text-gray-900">{testData.searchTerm}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Competitors</div>
                <div className="text-gray-900">{testData.competitors.length} products selected</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Variants</div>
                <div className="text-gray-900">
                  {activeVariants} variant{activeVariants !== 1 ? 's' : ''} configured
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-6">Demographics</h4>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Age Ranges</div>
                <div className="flex flex-wrap gap-2">
                  {testData.demographics.ageRanges.map(age => (
                    <span
                      key={age}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {age}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Gender</div>
                <div className="flex flex-wrap gap-2">
                  {testData.demographics.gender.map(gender => (
                    <span
                      key={gender}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {gender}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Locations</div>
                <div className="flex flex-wrap gap-2">
                  {testData.demographics.locations.map(location => (
                    <span
                      key={location}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Testers per Variant</div>
                <div className="text-gray-900">{testData.demographics.testerCount} testers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

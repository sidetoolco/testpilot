import { useState, useEffect } from 'react';
import { TestData } from '../../features/tests/types';
import { useCredits } from '../../features/credits/hooks/useCredits';
import { PurchaseCreditsModal } from '../../features/credits/components/PurchaseCreditsModal';
import { CreditCard, AlertTriangle, Plus, Info } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { Tooltip } from 'react-tooltip';

interface TestReviewProps {
  testData: TestData;
  onUpdateTestData: React.Dispatch<React.SetStateAction<TestData>>;
}

const CREDITS_PER_TESTER = 1;
const CREDITS_PER_TESTER_CUSTOM_SCREENING = 1.1;
const DOLLAR_VALUE_PER_CREDIT = 49;

export default function TestReview({ testData, onUpdateTestData }: TestReviewProps) {
  const [testName, setTestName] = useState(testData.name);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Get user's available credits
  const { data: creditsData, isLoading: creditsLoading } = useCredits();

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
  
  // Calculate credits based on custom screening
  const hasCustomScreening = testData.demographics.customScreening?.enabled && 
    testData.demographics.customScreening.question && 
    testData.demographics.customScreening.validAnswer;
  const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
  const totalCredits = totalTesters * creditsPerTester;
  const totalCost = totalCredits * DOLLAR_VALUE_PER_CREDIT;
  
  // Check if user has sufficient credits
  const availableCredits = creditsData?.total || 0;
  const hasSufficientCredits = availableCredits >= totalCredits;
  const creditsNeeded = Math.max(0, totalCredits - availableCredits);

  const handlePurchaseCredits = () => {
    setIsPurchaseModalOpen(true);
  };

  return (
    <Elements stripe={stripePromise}>
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
            <label htmlFor="testTitle" className="block text-md font-bold text-gray-700 mb-2 flex items-center gap-2">
              Test Title <span className="text-red-500">*</span>
              <Info
                className="h-4 w-4 text-gray-400 cursor-help"
                data-tooltip-id="test-title-tooltip"
              />
              <Tooltip id="test-title-tooltip" className="!px-2 !py-1 !text-sm">
                Enter a descriptive title that helps you identify your test.
              </Tooltip>
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

          {/* Credit Summary */}
          <div className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-[#00A67E]" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900">Test Cost</h4>
                  <p className="text-sm text-gray-500">
                    Based on {totalTesters} testers at {creditsPerTester} credit{creditsPerTester !== 1 ? 's' : ''} per tester
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold text-gray-900">{totalCredits.toFixed(1)}</div>
                <div className="text-sm text-gray-500">Credits</div>
                <div className="text-sm text-gray-400">≈ {formatPrice(totalCost)}</div>
              </div>
            </div>

            {/* Available Credits */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Available Credits</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {creditsLoading ? '...' : availableCredits.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  {hasSufficientCredits ? (
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">Sufficient</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Insufficient</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Insufficient Credits Warning */}
            {!hasSufficientCredits && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-2 ">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-red-800 mb-1">Insufficient Credits</h5>
                    <p className="text-sm text-red-700 mb-3">
                      You need {creditsNeeded.toFixed(1)} more credits to run this test.
                    </p>
                    <button
                      onClick={handlePurchaseCredits}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Buy More Credits</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Screening Indicator */}
            {hasCustomScreening && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    Custom screening enabled (+0.1 credit per tester)
                  </span>
                </div>
              </div>
            )}
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
                {/* Custom Screening Section */}
                <div>
                  <h4 className="text-xl font-semibold mb-6">Custom Screening</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Used</div>
                      <div className="text-gray-900">
                        {testData.demographics.customScreening.question ? 'Yes' : 'No'}
                      </div>
                    </div>
                    {testData.demographics.customScreening.question && (
                      <>
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Question</div>
                          <div className="text-gray-900">
                            {testData.demographics.customScreening.question}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">
                            Keep testers who answer
                          </div>
                          <div className="text-gray-900">
                            {testData.demographics.customScreening.validAnswer}
                          </div>
                        </div>
                      </>
                    )}
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

        {/* Purchase Credits Modal */}
        <PurchaseCreditsModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          creditsNeeded={!hasSufficientCredits ? creditsNeeded : undefined}
        />
      </div>
    </Elements>
  );
}

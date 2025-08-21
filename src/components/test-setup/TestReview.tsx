import { useState, useEffect } from 'react';
import { TestData } from '../../features/tests/types';
import { useCredits } from '../../features/credits/hooks/useCredits';
import { PurchaseCreditsModal } from '../../features/credits/components/PurchaseCreditsModal';
import { AlertTriangle, Plus, Info } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { Tooltip } from 'react-tooltip';
import { TestCost } from './TestCost';

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

          {/* Credit Summary */}
          <TestCost
            totalTesters={totalTesters}
            creditsPerTester={creditsPerTester}
            totalCredits={totalCredits}
            totalCost={totalCost}
            formatPrice={formatPrice}
            availableCredits={availableCredits}
            creditsLoading={creditsLoading}
            hasSufficientCredits={hasSufficientCredits}
            creditsNeeded={creditsNeeded}
            onPurchaseCredits={handlePurchaseCredits}
            size="large"
            showAvailableCredits={true}
            showInsufficientWarning={true}
          />

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
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Test Interface</div>
                  <div className="text-gray-900 capitalize">
                    {testData.skin === 'walmart' ? 'Walmart' : 'Amazon'} Skin
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

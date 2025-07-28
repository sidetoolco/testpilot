import { CreditIcon } from '../ui/CreditIcon';

interface TestCostProps {
  totalTesters: number;
  creditsPerTester: number;
  totalCredits: number;
  totalCost?: number;
  formatPrice?: (amount: number) => string;
  availableCredits?: number;
  creditsLoading?: boolean;
  hasSufficientCredits?: boolean;
  creditsNeeded?: number;
  onPurchaseCredits?: () => void;
  size?: 'small' | 'large';
  showAvailableCredits?: boolean;
  showInsufficientWarning?: boolean;
}

export function TestCost({
  totalTesters,
  creditsPerTester,
  totalCredits,
  totalCost,
  formatPrice,
  availableCredits,
  creditsLoading,
  hasSufficientCredits,
  creditsNeeded,
  onPurchaseCredits,
  size = 'small',
  showAvailableCredits = false,
  showInsufficientWarning = false,
}: TestCostProps) {
  const isLarge = size === 'large';
  
  return (
    <div className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div>
            <h4 className={`${isLarge ? 'text-xl' : 'text-sm'} font-medium text-gray-900`}>Test Cost</h4>
            <p className={`${isLarge ? 'text-sm' : 'text-xs'} text-gray-500`}>
              {totalTesters} testers × {creditsPerTester} credit{creditsPerTester !== 1 ? 's' : ''} per tester
            </p>
          </div>
        </div>
                  <div className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <CreditIcon size={isLarge ? 24 : 16} />
              <div className={`${isLarge ? 'text-3xl' : 'text-xl'} font-semibold text-gray-900`}>
                {totalCredits.toFixed(1)}
              </div>
            </div>
            <div className={`${isLarge ? 'text-sm' : 'text-xs'} text-gray-500`}>Credits</div>
          {totalCost && formatPrice && (
            <div className={`${isLarge ? 'text-sm' : 'text-xs'} text-gray-400`}>
              ≈ {formatPrice(totalCost)}
            </div>
          )}
        </div>
      </div>

      {/* Available Credits */}
      {showAvailableCredits && availableCredits !== undefined && (
        <div className="bg-white rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
                          <div>
                                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-700">Available Credits</p>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditIcon size={16} />
                  <p className="text-lg font-bold text-gray-900">
                    {creditsLoading ? '...' : availableCredits.toLocaleString()}
                  </p>
                </div>
              </div>
            <div className="text-right">
              {hasSufficientCredits ? (
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Sufficient</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Insufficient</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Credits Warning */}
      {showInsufficientWarning && !hasSufficientCredits && creditsNeeded && onPurchaseCredits && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-red-800 mb-1">Insufficient Credits</h5>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                <p className="text-sm text-red-700">
                  You need {creditsNeeded.toFixed(1)} more credits to publish this test.
                </p>
                <button
                  onClick={onPurchaseCredits}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm self-end lg:self-auto"
                >
                  <span>Buy More Credits</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
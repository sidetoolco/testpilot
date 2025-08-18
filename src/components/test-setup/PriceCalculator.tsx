import { Calculator } from 'lucide-react';
import { CreditIcon } from '../ui/CreditIcon';

interface PriceCalculatorProps {
  testerCount: number;
  variantCount: number;
  hasCustomScreening?: boolean;
}

const CREDITS_PER_TESTER = 1;
const CREDITS_PER_TESTER_CUSTOM_SCREENING = 1.1;
const DOLLAR_VALUE_PER_CREDIT = 49;

export function PriceCalculator({ testerCount, variantCount, hasCustomScreening = false }: PriceCalculatorProps) {
  const totalTesters = testerCount * variantCount;
  const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
  const totalCredits = totalTesters * creditsPerTester;
  const totalPrice = totalCredits * DOLLAR_VALUE_PER_CREDIT;

  return (
    <div className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
          <Calculator className="h-5 w-5 text-[#00A67E]" />
        </div>
        <h4 className="text-lg font-medium text-gray-900">Price Calculator</h4>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Total Testers</div>
          <div className="text-2xl font-semibold">
            {totalTesters} testers
            <span className="text-sm text-gray-500 ml-2">
              ({testerCount} × {variantCount} variants)
            </span>
          </div>
          {hasCustomScreening && (
            <div className="text-sm text-[#00A67E] mt-1">
              ✨ Custom screening enabled
            </div>
          )}
        </div>

        <div>
          <div className="text-sm text-gray-500 ">Total Credits</div>
          <div className="flex items-baseline space-x-1">
            <CreditIcon className='pt-1' />
            <span className="text-2xl font-semibold">{totalCredits.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {creditsPerTester} credit{creditsPerTester !== 1 ? 's' : ''} per tester
          </div>
          <div className="text-sm text-gray-400 mt-1">
            ≈ ${totalPrice.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

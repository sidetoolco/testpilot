import React from 'react';
import { Calculator, DollarSign } from 'lucide-react';

interface PriceCalculatorProps {
  testerCount: number;
  variantCount: number;
}

const PRICE_PER_TESTER = 49;

export function PriceCalculator({ testerCount, variantCount }: PriceCalculatorProps) {
  const totalTesters = testerCount * variantCount;
  const totalPrice = totalTesters * PRICE_PER_TESTER;

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
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Total Price</div>
          <div className="flex items-baseline space-x-1">
            <DollarSign className="h-5 w-5 text-[#00A67E]" />
            <span className="text-2xl font-semibold">{totalPrice.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            ${PRICE_PER_TESTER} per tester
          </div>
        </div>
      </div>
    </div>
  );
}
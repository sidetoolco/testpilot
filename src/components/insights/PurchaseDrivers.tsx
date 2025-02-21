import React from 'react';
import { motion } from 'framer-motion';

export default function PurchaseDrivers() {
  const drivers = [
    { name: 'Value', variant1: 4.8, variant2: 4.4 },
    { name: 'Aesthetics', variant1: 4.6, variant2: 4.1 },
    { name: 'Utility', variant1: 3.9, variant2: 4.0 },
    { name: 'Trust', variant1: 4.5, variant2: 4.2 },
    { name: 'Convenience', variant1: 4.1, variant2: 4.1 }
  ];

  const variants = [
    { id: 1, name: 'Variant #1', color: '#00A67E' },
    { id: 2, name: 'Variant #2', color: '#1B1B31' },
    { id: 3, name: 'Variant #3', color: '#1B1B31' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-semibold text-gray-900">Purchase Drivers</h3>
        <div className="flex items-center space-x-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                variant.id === 1
                  ? 'bg-[#00A67E] bg-opacity-10 text-[#00A67E]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {variant.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[400px] mt-12">
        {/* Y-axis */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-sm text-gray-500">
          {[5, 4, 3, 2, 1, 0].map((value) => (
            <span key={value} className="text-right pr-4">{value}</span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="ml-12 h-full">
          <div className="grid grid-cols-5 gap-8 h-full pb-8">
            {drivers.map((driver, index) => (
              <div key={index} className="relative">
                {/* Grid lines */}
                <div className="absolute inset-0">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="border-b border-gray-100"
                      style={{ bottom: `${(i * 100) / 5}%` }}
                    />
                  ))}
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-center space-x-3">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(driver.variant1 / 5) * 100}%` }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="w-6 bg-[#00A67E] rounded-sm relative group"
                  >
                    {/* Always show value above bar */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-gray-600 text-sm font-medium">
                      {driver.variant1}
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#00A67E] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Variant #1: {driver.variant1}
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(driver.variant2 / 5) * 100}%` }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                    className="w-6 bg-[#1B1B31] rounded-sm relative group"
                  >
                    {/* Always show value above bar */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-gray-600 text-sm font-medium">
                      {driver.variant2}
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1B1B31] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Variant #2: {driver.variant2}
                    </div>
                  </motion.div>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 -mb-8 text-center">
                  <span className="text-sm font-medium text-gray-600">{driver.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-8 mt-12">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-[#00A67E] rounded-sm"></div>
          <span className="text-sm text-gray-600">Variant #1</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-[#1B1B31] rounded-sm"></div>
          <span className="text-sm text-gray-600">Variant #2</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-8">
        Your bottle aesthetics made a big impact on shoppers driving strong differentiation vs. competition. 
        Utility score was just a bit low but this is to be expected for an experiential item.
      </p>
    </div>
  );
}
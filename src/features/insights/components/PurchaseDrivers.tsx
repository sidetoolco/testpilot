import React from 'react';
import { motion } from 'framer-motion';

interface DriverData {
  category: string;
  value: number;
  aesthetics: number;
  utility: number;
  trust: number;
  convenience: number;
}

const drivers: DriverData[] = [
  {
    category: 'Variant #1',
    value: 4.8,
    aesthetics: 4.6,
    utility: 4.0,
    trust: 4.5,
    convenience: 4.3
  },
  {
    category: 'Variant #2',
    value: 4.4,
    aesthetics: 4.1,
    utility: 4.0,
    trust: 4.2,
    convenience: 4.1
  }
];

const categories = ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'];

export default function PurchaseDrivers() {
  return (
    <div className="bg-white rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold mb-6">Purchase Drivers</h3>
      <div className="flex space-x-8">
        {categories.map((category) => (
          <div key={category} className="flex-1">
            <div className="text-center text-sm text-gray-600 mb-2">{category}</div>
            <div className="relative h-48">
              {drivers.map((driver, index) => (
                <div
                  key={index}
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${(driver[category.toLowerCase() as keyof DriverData] / 5) * 100}%`,
                    backgroundColor: index === 0 ? '#40E0D0' : '#2E3A59',
                    opacity: index === 0 ? 1 : 0.8,
                    marginLeft: index * 20,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';

export default function VariantComparison() {
  const variants = [
    {
      name: 'Variant #1',
      shareOfClicks: 14,
      shareOfBuy: 17,
      valueScore: 4.8,
      win95Confidence: true,
      status: 'success'
    },
    {
      name: 'Variant #2',
      shareOfClicks: 6,
      shareOfBuy: 4,
      valueScore: 4.1,
      win95Confidence: false,
      status: 'warning'
    },
    {
      name: 'Variant #3',
      shareOfClicks: 6,
      shareOfBuy: 9,
      valueScore: 4.2,
      win95Confidence: false,
      status: 'warning'
    },
    {
      name: 'Competitors (AVG)',
      shareOfClicks: 8,
      shareOfBuy: 6,
      valueScore: 4.4,
      win95Confidence: false,
      status: 'neutral'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Variant Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Variant</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Share of Clicks</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Share of Buy</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Value Score</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Win? (95% Confidence)</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 px-4">{variant.name}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${
                    variant.shareOfClicks > 10
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {variant.shareOfClicks}%
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${
                    variant.shareOfBuy > 10
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {variant.shareOfBuy}%
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${
                    variant.valueScore > 4.5
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {variant.valueScore}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${
                    variant.win95Confidence
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {variant.win95Confidence ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
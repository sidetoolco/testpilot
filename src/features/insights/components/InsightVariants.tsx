import React from 'react';
import { motion } from 'framer-motion';

interface VariantData {
  name: string;
  shareOfClicks: number;
  shareOfBuy: number;
  valueScore: number;
  win95Confidence: boolean;
}

const variants: VariantData[] = [
  {
    name: 'Variant #1',
    shareOfClicks: 14,
    shareOfBuy: 17,
    valueScore: 4.8,
    win95Confidence: true
  },
  {
    name: 'Variant #2',
    shareOfClicks: 6,
    shareOfBuy: 4,
    valueScore: 4.1,
    win95Confidence: false
  },
  {
    name: 'Variant #3',
    shareOfClicks: 6,
    shareOfBuy: 9,
    valueScore: 4.2,
    win95Confidence: false
  },
  {
    name: 'Competitors (AVG)',
    shareOfClicks: 6,
    shareOfBuy: 6,
    valueScore: 4.4,
    win95Confidence: false
  }
];

export default function InsightVariants() {
  return (
    <div className="bg-white rounded-xl p-6 mb-8">
      <table className="w-full">
        <thead>
          <tr className="text-sm text-gray-600">
            <th className="text-left font-medium py-2">Variant</th>
            <th className="text-left font-medium py-2">Share of Clicks</th>
            <th className="text-left font-medium py-2">Share of Buy</th>
            <th className="text-left font-medium py-2">Value Score</th>
            <th className="text-left font-medium py-2">Win? (95% Confidence)</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant, index) => (
            <tr key={index} className="border-t border-gray-100">
              <td className="py-3">{variant.name}</td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded ${
                  variant.shareOfClicks > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {variant.shareOfClicks}%
                </span>
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded ${
                  variant.shareOfBuy > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {variant.shareOfBuy}%
                </span>
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded ${
                  variant.valueScore > 4.5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {variant.valueScore}
                </span>
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded ${
                  variant.win95Confidence ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {variant.win95Confidence ? 'Yes' : 'No'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
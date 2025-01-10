import React from 'react';
import { motion } from 'framer-motion';

interface StrengthWeaknessProps {
  aspect: string;
  score: number;
  competitorAvg: number;
  impact: 'high' | 'medium' | 'low';
  type: 'strength' | 'weakness';
}

function StrengthWeakness({ aspect, score, competitorAvg, impact, type }: StrengthWeaknessProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium text-gray-900">{aspect}</h3>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`text-sm ${type === 'strength' ? 'text-[#00A67E]' : 'text-[#FF4757]'}`}>
            Our score: {score}
          </span>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">
            Competitor avg: {competitorAvg}
          </span>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm ${
        impact === 'high' 
          ? type === 'strength' ? 'bg-[#E3F9F3] text-[#00A67E]' : 'bg-red-50 text-red-600'
          : 'bg-yellow-50 text-yellow-600'
      }`}>
        {impact} impact
      </span>
    </div>
  );
}

export default function CompetitiveAnalysis() {
  const strengths = [
    {
      aspect: 'Eco-Friendly Packaging',
      score: 9.2,
      competitorAvg: 6.8,
      impact: 'high' as const
    },
    {
      aspect: 'Brand Trust',
      score: 8.7,
      competitorAvg: 7.9,
      impact: 'medium' as const
    }
  ];

  const weaknesses = [
    {
      aspect: 'Price Point',
      score: 6.4,
      competitorAvg: 7.8,
      impact: 'high' as const
    },
    {
      aspect: 'Product Size Options',
      score: 6.9,
      competitorAvg: 8.1,
      impact: 'medium' as const
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-8 mb-12">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Competitive Strengths</h2>
        <div className="space-y-6">
          {strengths.map((strength, index) => (
            <StrengthWeakness
              key={index}
              {...strength}
              type="strength"
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Areas for Improvement</h2>
        <div className="space-y-6">
          {weaknesses.map((weakness, index) => (
            <StrengthWeakness
              key={index}
              {...weakness}
              type="weakness"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
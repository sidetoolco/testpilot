import React from 'react';
import { Test } from '../../../../types';

interface TestConfigurationProps {
  test: Test;
}

export default function TestConfiguration({ test }: TestConfigurationProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Test Configuration</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Search Term</div>
            <div className="text-gray-900">{test.searchTerm}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Competitors</div>
            <div className="flex flex-wrap gap-2">
              {test.competitors.map((competitor, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                  <img src={competitor.image_url} alt={competitor.name} className="w-8 h-8 object-contain" />
                  <span className="text-sm text-gray-700">{competitor.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Variations</div>
            <div className="text-gray-900">
              {Object.values(test.variations).filter(v => v !== null).map((variation, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 m-1">
                  <img src={variation.image_url} alt={variation.title} className="w-8 h-8 object-contain" />
                  <span className="text-sm text-gray-700">{variation.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Demographics</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Age Ranges</div>
            <div className="flex flex-wrap gap-2">
              {test.demographics.ageRanges.map((age, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {age}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Gender</div>
            <div className="flex flex-wrap gap-2">
              {test.demographics.gender.map((g, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Locations</div>
            <div className="flex flex-wrap gap-2">
              {test.demographics.locations.map((location, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {location}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
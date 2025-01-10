import React from 'react';
import { motion } from 'framer-motion';

export default function AdditionalObservations() {
  const observations = [
    {
      text: "Softee's Mineral Bath also performed well, racking up the highest Share of Clicks at a whopping 24% (3X average) and an 18% Share of Buy. Aesthetics were a big driver but Value was as well — notably, this item is priced 17% below the average of tested items."
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Additional Observations</h3>
      <div className="space-y-4">
        {observations.map((observation, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-1">
              <p className="text-gray-600 leading-relaxed">{observation.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
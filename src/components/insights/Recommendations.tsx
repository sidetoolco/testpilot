import React from 'react';
import { motion } from 'framer-motion';

export default function Recommendations() {
  const recommendations = [
    "While a bit polarizing, Eucalyptus Glow is a standout with great metrics and comments overall. Well done, Amanda!",
    "Packaging looks to be well received — consider using your pack's natural, calming visuals in other marketing touchpoints.",
    'Continue to optimize on "natural" eucalyptus communications and stay away from "spa" imagery which has less favorable connotations in the category.'
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src="https://i.imghippo.com/files/bfH2616k.png"
            alt="ACE AI Assistant"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#00A67E] bg-opacity-5 rounded-xl p-4"
          >
            <p className="text-gray-800">{recommendation}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
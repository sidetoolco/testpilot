import React from 'react';
import { motion } from 'framer-motion';
import { TestSession } from '../../types';

interface InsightHeaderProps {
  session: TestSession;
}

export default function InsightHeader({ session }: InsightHeaderProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start space-x-6">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 mb-4"
          >
            <div className="w-12 h-12 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
              <img 
                src="https://i.imghippo.com/files/bfH2616k.png" 
                alt="AI Assistant"
                className="w-8 h-8 rounded-full"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Congrats, Amanda!</h2>
              <p className="text-gray-600">Your first variant significantly outperformed the competitive set.</p>
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 leading-relaxed"
          >
            The bold but familiar scent name stood out from more traditional competitive options. At your price point, perceived value was exceptional outperforming all other items on shelf. Unfortunately, the other two options underperformed.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
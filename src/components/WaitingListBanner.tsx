import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function WaitingListBanner() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#00A67E] bg-opacity-10 border-b border-[#00A67E] border-opacity-20 backdrop-blur-sm"
      >
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="bg-[#00A67E] bg-opacity-10 rounded-full p-2">
              <Clock className="h-5 w-5 text-[#00A67E]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Welcome to TestPilot! 🎉
              </h3>
              <p className="text-gray-600">
                You've been added to our waiting list. We're currently reviewing your application and will notify you as soon as your account is activated. This usually takes 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
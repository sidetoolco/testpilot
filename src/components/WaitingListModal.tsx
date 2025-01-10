import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function WaitingListModal() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-xl w-full mx-4 shadow-xl"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-[#00A67E] bg-opacity-10 rounded-full p-3">
            <Clock className="h-6 w-6 text-[#00A67E]" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">
              Welcome to TestPilot! 🎉
            </h3>
          </div>
        </div>

        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          You've been added to our waiting list. We're currently reviewing your application and will notify you as soon as your account is activated.
        </p>

        <div className="bg-[#00A67E] bg-opacity-5 rounded-xl p-4">
          <p className="text-[#00A67E] text-sm">
            We'll send you an email when your account is ready.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
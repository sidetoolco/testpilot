import { motion } from 'framer-motion';
import { PlayCircle, Users2, Plus } from 'lucide-react';
import { CreditIcon } from '../ui/CreditIcon';
import { useState } from 'react';
import { PurchaseCreditsModal } from '../../features/credits/components/PurchaseCreditsModal';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { formatCredits } from '../../utils/format';

interface StatisticsCardsProps {
  activeTests: number;
  completedTests: number;
  availableCredits: number;
  creditsLoading?: boolean;
}

export function StatisticsCards({
  activeTests,
  completedTests,
  availableCredits,
  creditsLoading = false,
}: StatisticsCardsProps) {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const handlePurchaseCredits = () => {
    setIsPurchaseModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* Active Tests Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#F0F7FF] to-[#F8FAFF] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
              <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-[#00A67E]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg lg:text-xl font-medium text-gray-900">Active Tests</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#00A67E] mt-1">{activeTests}</p>
            </div>
          </div>
        </motion.div>

        {/* Completed Tests Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#F0F7FF] to-[#F8FAFF] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md "
        >
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-[#2E90FA] bg-opacity-10 rounded-full flex items-center justify-center">
              <Users2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-[#2E90FA]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg lg:text-xl font-medium text-gray-900">Completed Tests</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2E90FA] mt-1">{completedTests}</p>
            </div>
          </div>
        </motion.div>

        {/* Available Credits Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#F0F7FF] to-[#F8FAFF] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <CreditIcon size={20} className='text-primary sm:w-6 sm:h-6 lg:w-7 lg:h-7' />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-medium">Available Credits</h3>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-primary mt-1">
                  {creditsLoading ? '...' : formatCredits(availableCredits)}
                </p>
              </div>
            </div>
            <button
              onClick={handlePurchaseCredits}
              className="p-2 text-primary hover:text-primary-700 hover:bg-primary-200 rounded-lg transition-colors"
              title="Buy more credits"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Purchase Credits Modal */}
      <Elements stripe={stripePromise}>
        <PurchaseCreditsModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
        />
      </Elements>
    </>
  );
} 
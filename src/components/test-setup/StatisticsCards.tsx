import { motion } from 'framer-motion';
import { PlayCircle, Users2 } from 'lucide-react';
import { CreditIcon } from '../ui/CreditIcon';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {/* Active Tests Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all"
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
        className="bg-gradient-to-br from-[#F0F7FF] to-[#F8FAFF] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all"
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
        className="rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all bg-primary-50"
      >
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
            <CreditIcon size={20} className='text-primary sm:w-6 sm:h-6 lg:w-7 lg:h-7' />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg lg:text-xl font-medium">Available Credits</h3>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-primary mt-1">
              {creditsLoading ? '...' : availableCredits.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 
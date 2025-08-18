import { useState } from 'react';
import { useCredits } from '../features/credits/hooks/useCredits';
import {  RefreshCw } from 'lucide-react';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { TransactionsTable } from '../features/credits/components/TransactionsTable';
import { AvailableCreditsCard } from '../features/credits/components/AvailableCreditsCard';
import { PurchaseCreditsModal } from '../features/credits/components/PurchaseCreditsModal';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { CreditIcon } from '../components/ui/CreditIcon';


const MAX_TRANSACTIONS_PER_PAGE = 20;

export default function Billing() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const { data, isLoading, error} = useCredits(currentPage, MAX_TRANSACTIONS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePurchaseCredits = () => {
    setIsPurchaseModalOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6 p-8">
        <ErrorMessage message="Failed to load balance data. Please try again." />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Available Credits & Transactions</h1>
        </div>


        <div className="flex items-center gap-6"> 
          <div className="flex-1"> 
            <AvailableCreditsCard 
              totalCredits={data?.total || 0} 
              isLoading={isLoading}
              hasPendingTransactions={data?.transactions?.data?.some(t => t.status === 'pending')}
            />
          </div>
          <div className="mt-16 pt-1">
          <button
            onClick={handlePurchaseCredits}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditIcon className="text-white" />
            <span>Buy Credits</span>
          </button>
          </div>
        </div>
    

        {/* Transactions Table */}
        {data?.transactions && (
          <TransactionsTable
            transactions={data.transactions.data}
            isLoading={isLoading}
            currentPage={data.transactions.page}
            totalPages={data.transactions.totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Empty State */}
        {!isLoading && data?.transactions.data.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <RefreshCw className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500">
              Your transaction history will appear here once you start using credits.
            </p>
          </div>
        )}
      </div>
      <PurchaseCreditsModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </Elements>
  );
}
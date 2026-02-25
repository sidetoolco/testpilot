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
import { PageShell } from '../components/ui/layout/PageShell';
import { PageHeader } from '../components/ui/layout/PageHeader';
import { SectionCard } from '../components/ui/layout/SectionCard';
import { EmptyState } from '../components/ui/layout/EmptyState';


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
      <PageShell className="space-y-6">
        <ErrorMessage message="Failed to load balance data. Please try again." />
      </PageShell>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PageShell className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Available Credits & Transactions"
          actions={
            <button
              onClick={handlePurchaseCredits}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditIcon className="text-white" />
              <span>Buy Credits</span>
            </button>
          }
        />


        <div className="flex items-center gap-6"> 
          <div className="flex-1"> 
            <AvailableCreditsCard 
              totalCredits={data?.total || 0} 
              isLoading={isLoading}
              hasPendingTransactions={data?.transactions?.data?.some(t => t.status === 'pending')}
            />
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
        {!isLoading && data?.transactions?.data && data.transactions.data.length === 0 && (
          <SectionCard>
            <EmptyState
              title="No transactions yet"
              description="Your transaction history will appear here once you start using credits."
              icon={<RefreshCw className="h-12 w-12 mx-auto" />}
            />
          </SectionCard>
        )}
      </PageShell>
      <PurchaseCreditsModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </Elements>
  );
}
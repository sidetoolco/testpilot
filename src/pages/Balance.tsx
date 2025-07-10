import { useState } from 'react';
import { useCredits } from '../features/credits/hooks/useCredits';
import { RefreshCw } from 'lucide-react';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { TransactionsTable } from '../features/credits/components/TransactionsTable';
import { AvailableCreditsCard } from '../features/credits/components/AvailableCreditsCard';

const MAX_TRANSACTIONS_PER_PAGE = 20;

export default function Balance() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error, refetch } = useCredits(currentPage, MAX_TRANSACTIONS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Available Credits & Transactions</h1>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
        <ErrorMessage message="Failed to load balance data. Please try again." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Available Credits & Transactions</h1>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Balance Card */}
      <AvailableCreditsCard totalCredits={data?.total || 0} isLoading={isLoading} />

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
  );
}

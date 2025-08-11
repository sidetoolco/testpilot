import { CreditIcon } from '../../../components/ui/CreditIcon';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useRefreshCredits } from '../hooks/useRefreshCredits';

interface AvailableCreditsCardProps {
  totalCredits: number;
  isLoading?: boolean;
  hasPendingTransactions?: boolean;
}

export function AvailableCreditsCard({ totalCredits, isLoading, hasPendingTransactions }: AvailableCreditsCardProps) {
  const { refreshCredits, isRefreshing } = useRefreshCredits();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl max-w-sm shadow-sm border border-primary-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-sm font-medium text-primary-700">Available Credits</p>
            {hasPendingTransactions && (
              <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>Pending</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <CreditIcon size={28} className="text-primary-600 fill-primary-600" />
            <p className="text-3xl font-bold text-primary-900">{totalCredits}</p>
          </div>
          {hasPendingTransactions && (
            <p className="text-xs text-yellow-700 mt-1">
              You have pending payments. Click refresh to process them.
            </p>
          )}
        </div>
        <button
          onClick={refreshCredits}
          disabled={isRefreshing}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            hasPendingTransactions 
              ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-200' 
              : 'text-primary-600 hover:text-primary-700 hover:bg-primary-200'
          }`}
          title={hasPendingTransactions ? "Process pending payments and refresh credits" : "Refresh credits"}
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}

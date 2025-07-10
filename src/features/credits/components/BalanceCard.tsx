import { DollarSign } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  isLoading?: boolean;
}

export function BalanceCard({ balance, isLoading }: BalanceCardProps) {
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

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(balance / 100); // Convert cents to dollars

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-sm border border-primary-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary-700 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-primary-900">{formattedBalance}</p>
        </div>
        <div className="bg-primary-500 p-3 rounded-lg">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

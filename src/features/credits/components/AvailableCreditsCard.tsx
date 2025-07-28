import { CreditIcon } from '../../../components/ui/CreditIcon';

interface AvailableCreditsCardProps {
  totalCredits: number;
  isLoading?: boolean;
}

export function AvailableCreditsCard({ totalCredits, isLoading }: AvailableCreditsCardProps) {
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
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-sm border border-primary-200 p-6">
      <div>
        <p className="text-sm font-medium text-primary-700 mb-1">Available Credits</p>
        <div className="flex items-center space-x-2">
          <CreditIcon size={28} className="text-primary-600 fill-primary-600" />
          <p className="text-3xl font-bold text-primary-900">{totalCredits}</p>
        </div>
      </div>
    </div>
  );
}

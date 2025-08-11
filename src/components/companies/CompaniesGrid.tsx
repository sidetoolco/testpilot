import { Building2, Users, CreditCard, Trash2, Eye, AlertTriangle, Brain } from 'lucide-react';
import { Pagination } from '../common/Pagination';
import { CreditIcon } from '../ui/CreditIcon';

interface Company {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  credits?: number;
  user_count?: number;
  test_count?: number;
  waiting_list?: boolean;
  expert_mode?: boolean;
}

interface CompaniesGridProps {
  companies: Company[];
  onViewDetails: (company: Company) => void | Promise<void>;
  onEditCredits: (company: Company) => void; // This opens a modal to edit credits directly
  onDeleteCompany: (company: Company) => void;
  onActivateCompany: (company: Company) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  totalItems: number;
  itemsPerPage: number;
}

export const CompaniesGrid = ({
  companies,
  onViewDetails,
  onEditCredits,
  onDeleteCompany,
  onActivateCompany,
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPreviousPage,
  totalItems,
  itemsPerPage,
}: CompaniesGridProps) => {
  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Companies ({totalItems})</h3>
      </div>

      {/* Companies Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{company.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {company.created_at ? `Created ${new Date(company.created_at).toLocaleDateString()}` : 'Company'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-600">Users</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {company.user_count || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-600">Credits</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {company.credits || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-400 rounded-full" />
                    <span className="text-xs sm:text-sm text-gray-600">Tests</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {company.test_count || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-600">Status</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                      company.waiting_list 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {company.waiting_list ? 'Waiting List' : 'Active'}
                    </span>
                    {company.expert_mode && (
                      <Brain className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onViewDetails(company)}
                  className="flex-1 min-w-[120px] flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Details</span>
                </button>
                {company.waiting_list && (
                  <button
                    onClick={() => onActivateCompany(company)}
                    className="flex-1 min-w-[120px] flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="hidden sm:inline">Activate</span>
                  </button>
                )}
                <button
                  onClick={() => onEditCredits(company)}
                  className="flex-1 min-w-[120px] flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <CreditIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit Credits</span>
                </button>
                <button
                  onClick={() => onDeleteCompany(company)}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors min-w-[44px]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}; 
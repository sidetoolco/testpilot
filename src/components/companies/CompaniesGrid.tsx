import { Building2, Users, CreditCard, Trash2, Eye } from 'lucide-react';
import { Pagination } from '../common/Pagination';

interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  credits?: number;
  user_count?: number;
  test_count?: number;
}

interface CompaniesGridProps {
  companies: Company[];
  onViewDetails: (company: Company) => void;
  onAddCredits: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
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
  onAddCredits,
  onDeleteCompany,
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
        <p className="text-gray-500">No companies have been created yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Companies ({totalItems})</h3>
      </div>

      {/* Companies Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created {new Date(company.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Users</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {company.user_count || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Credits</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {company.credits || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-400 rounded-full" />
                    <span className="text-sm text-gray-600">Tests</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {company.test_count || 0}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onViewDetails(company)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => onAddCredits(company)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Add Credits</span>
                </button>
                <button
                  onClick={() => onDeleteCompany(company)}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
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
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  CreditCard,
  Trash2,
  Plus,
  Search,
  Eye,
  AlertTriangle,
  XCircle,
  Loader2,
} from 'lucide-react';
import apiClient from '../lib/api';
import { useCompanies } from '../hooks/useCompanies';
import { CompaniesGrid } from '../components/companies/CompaniesGrid';
import { useAdmin } from '../hooks/useAdmin';

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

interface CompanyWithDetails extends Company {
  profiles: Array<{
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
  }>;
  tests: Array<{
    id: string;
    name: string;
    status: string;
    created_at: string;
  }>;
}



// Memoized Company Card Component
const CompanyCard = memo(({ 
  company, 
  onViewDetails, 
  onAddCredits, 
  onDelete,
  onActivate
}: {
  company: Company;
  onViewDetails: (company: Company) => void;
  onAddCredits: (company: Company) => void;
  onDelete: (company: Company) => void;
  onActivate: (company: Company) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
          <p className="text-sm text-gray-500">
            {company.created_at && company.created_at !== '' ? `Created ${new Date(company.created_at).toLocaleDateString()}` : 'Company'}
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
        <span className="text-sm font-medium text-gray-900">{company.user_count || 0}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Credits</span>
        </div>
        <span className="text-sm font-medium text-gray-900">{company.credits || 0}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Tests</span>
        </div>
        <span className="text-sm font-medium text-gray-900">{company.test_count || 0}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Status</span>
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          company.waiting_list 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {company.waiting_list ? 'Waiting List' : 'Active'}
        </span>
      </div>
    </div>

    <div className="flex space-x-2">
      <button
        onClick={() => onViewDetails(company)}
        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Eye className="h-4 w-4" />
        <span>Details</span>
      </button>
      {company.waiting_list && (
        <button
          onClick={() => onActivate(company)}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Activate</span>
        </button>
      )}
      <button
        onClick={() => onAddCredits(company)}
        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Add Credits</span>
      </button>
      <button
        onClick={() => onDelete(company)}
        className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
));

CompanyCard.displayName = 'CompanyCard';

// Memoized Search Input Component
const SearchInput = memo(({ 
  searchQuery, 
  onSearchChange,
  isSearching,
  showMinCharHint
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  showMinCharHint: boolean;
}) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
    <input
      type="text"
      placeholder="Search companies..."
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    />
    {isSearching && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
      </div>
    )}
    {showMinCharHint && (
      <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
        Type at least 3 characters to search
      </div>
    )}
  </div>
));

SearchInput.displayName = 'SearchInput';

export default function CompaniesManagement() {
  const { isAdmin } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsToEdit, setCreditsToEdit] = useState('');
  const [initialCredits, setInitialCredits] = useState(0);
  const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Use the custom hook for company data management with pagination
  const {
    companies,
    loading,
    currentPage,
    companiesPerPage,
    totalCompanies,
    clearCache,
    updateCompanyCredits,
    updateCompanyWaitingList,
    removeCompany,
    searchCompanies,
    getTotalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
  } = useCompanies(isAdmin);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Get pagination data
  const totalPages = getTotalPages();

  // Memoized event handlers
  const handleViewDetails = useCallback(async (company: Company) => {
    try {
      // Get detailed company information
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .eq('company_id', company.id as any)
        .order('created_at', { ascending: false });

      const { data: tests } = await supabase
        .from('tests')
        .select('id, name, status, created_at')
        .eq('company_id', company.id as any)
        .order('created_at', { ascending: false });

      setSelectedCompany({
        ...company,
        profiles: (profiles as any) || [],
        tests: (tests as any) || [],
      });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading company details:', error);
      toast.error('Failed to load company details');
    }
  }, []);

  const handleEditCredits = useCallback(async () => {
    if (!selectedCompany || !creditsToEdit || isNaN(Number(creditsToEdit))) {
      toast.error('Please enter a valid number of credits');
      return;
    }

    try {
      setIsUpdatingCredits(true);
      const newCredits = Number(creditsToEdit);
      const creditsDifference = newCredits - initialCredits;

      // Update credits using the new edit endpoint
      await apiClient.post('/credits/admin/edit', {
        company_id: selectedCompany.id,
        credits: newCredits,
        description: `Admin set credits from ${initialCredits} to ${newCredits}`
      });

      const action = creditsDifference >= 0 ? 'Increased' : 'Decreased';
      const absCredits = Math.abs(creditsDifference);
      toast.success(`${action} credits for ${selectedCompany.name} from ${initialCredits} to ${newCredits}`);
      setShowCreditsModal(false);
      setCreditsToEdit('');
      setInitialCredits(0);
      
      // Update the company credits in state
      updateCompanyCredits(selectedCompany.id, newCredits);
      
      // Update the selected company state as well
      setSelectedCompany(prev => 
        prev && prev.id === selectedCompany.id 
          ? { ...prev, credits: newCredits }
          : prev
      );

      // Clear cache to force refresh on next load
      clearCache();
    } catch (error: any) {
      console.error('Error updating credits:', error);
      if (error.response?.status === 400) {
        toast.error('Invalid credit value. Please enter a valid number (0 or greater).');
      } else if (error.response?.status === 404) {
        toast.error('Company not found. Please refresh and try again.');
      } else {
        toast.error('Failed to update credits. Please try again.');
      }
    } finally {
      setIsUpdatingCredits(false);
    }
  }, [selectedCompany, creditsToEdit, initialCredits, updateCompanyCredits, clearCache]);

  const handleDeleteCompany = useCallback(async () => {
    if (!selectedCompany) return;

    try {
      setIsDeleting(true);

      // First, delete all related data in the correct order
      // Delete profiles (users) associated with this company
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .eq('company_id', selectedCompany.id as any);

      if (profilesError) {
        console.error('Error deleting profiles:', profilesError);
        throw new Error('Failed to delete company profiles');
      }

      // Delete tests associated with this company
      const { error: testsError } = await supabase
        .from('tests')
        .delete()
        .eq('company_id', selectedCompany.id as any);

      if (testsError) {
        console.error('Error deleting tests:', testsError);
        throw new Error('Failed to delete company tests');
      }

      // Delete any other related data (add more tables as needed)
      // For example, if you have credits, transactions, etc.
      
      // Finally, delete the company itself
      const { error: companyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', selectedCompany.id as any);

      if (companyError) {
        console.error('Error deleting company:', companyError);
        throw new Error('Failed to delete company');
      }

      toast.success(`Deleted company: ${selectedCompany.name}`);
      setShowDeleteModal(false);
      setSelectedCompany(null);
      
      // Remove the company from the local state immediately
      removeCompany(selectedCompany.id);
      
      // Clear cache to force refresh on next load
      clearCache();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete company');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedCompany, clearCache, removeCompany]);

  const handleSearchChange = useCallback(async (value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // If search is empty, reset to normal view immediately
    if (!value.trim()) {
      resetPagination();
      await searchCompanies('');
      setIsSearching(false);
      return;
    }
    
    // Only search if we have at least 3 characters
    if (value.trim().length < 3) {
      setIsSearching(false);
      return;
    }
    
    // Show loading state
    setIsSearching(true);
    
    // Debounce the search - wait 500ms after user stops typing
    const timeout = setTimeout(async () => {
      try {
        resetPagination();
        await searchCompanies(value);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 500);
    
    setSearchTimeout(timeout);
  }, [resetPagination, searchCompanies, searchTimeout]);

  const handleOpenEditCredits = useCallback((company: Company) => {
    setSelectedCompany(company as CompanyWithDetails);
    setInitialCredits(company.credits || 0);
    setCreditsToEdit((company.credits || 0).toString());
    setShowCreditsModal(true);
  }, []);

  const handleOpenDelete = useCallback((company: Company) => {
    setSelectedCompany(company as CompanyWithDetails);
    setShowDeleteModal(true);
  }, []);

  const handleActivateCompany = useCallback(async (company: Company) => {
    try {
      await updateCompanyWaitingList(company.id, false);
      toast.success(`Company ${company.name} has been activated!`);
    } catch (error) {
      console.error('Error activating company:', error);
      toast.error('Failed to activate company');
    }
  }, [updateCompanyWaitingList]);

  // Memoized loading state
  const loadingComponent = useMemo(() => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
    </div>
  ), []);

  // Memoized empty state
  const emptyStateComponent = useMemo(() => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchQuery.trim().length >= 3 ? 'No companies found' : 'Search companies'}
      </h3>
      <p className="text-gray-500">
        {searchQuery.trim().length >= 3 
          ? 'Try adjusting your search terms or use different keywords.' 
          : searchQuery.trim().length > 0 
            ? 'Type at least 3 characters to search'
            : 'No companies have been created yet.'
        }
      </p>
    </div>
  ), [searchQuery]);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
          <p className="text-gray-600 mt-1">Manage all companies and their credits</p>
        </div>
        <div className="flex items-center space-x-4">
          <SearchInput 
            searchQuery={searchQuery} 
            onSearchChange={handleSearchChange}
            isSearching={isSearching}
            showMinCharHint={searchQuery.trim().length > 0 && searchQuery.trim().length < 3}
          />
        </div>
      </div>

      {/* Companies Grid with Pagination */}
      {loading || isSearching ? (
        loadingComponent
      ) : companies.length === 0 ? (
        emptyStateComponent
      ) : (
        <CompaniesGrid
          companies={companies}
          onViewDetails={handleViewDetails}
          onEditCredits={handleOpenEditCredits}
          onDeleteCompany={handleOpenDelete}
          onActivateCompany={handleActivateCompany}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          onNextPage={goToNextPage}
          onPreviousPage={goToPreviousPage}
          totalItems={totalCompanies}
          itemsPerPage={companiesPerPage}
        />
      )}

      {/* Company Details Modal */}
      {showDetailsModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedCompany.name}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Company ID</span>
                    <p className="text-sm text-gray-900">{selectedCompany.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <p className="text-sm text-gray-900">
                      {selectedCompany.created_at ? new Date(selectedCompany.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Updated</span>
                    <p className="text-sm text-gray-900">
                      {selectedCompany.updated_at ? new Date(selectedCompany.updated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Credits</span>
                    <p className="text-sm text-gray-900">{selectedCompany.credits || 0}</p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members ({selectedCompany.profiles.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCompany.profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                        <p className="text-xs text-gray-500">{profile.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        profile.role === 'admin' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {profile.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tests */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tests ({selectedCompany.tests.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedCompany.tests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{test.name}</p>
                      <p className="text-xs text-gray-500">
                        Created {new Date(test.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      test.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : test.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Credits Modal */}
      {showCreditsModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Company Credits</h2>
              <button
                onClick={() => setShowCreditsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company: {selectedCompany.name}
                </label>
              </div>

              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Credits
                </label>
                <input
                  type="number"
                  id="credits"
                  value={creditsToEdit}
                  onChange={(e) => setCreditsToEdit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter new credit amount (0 or greater)"
                  min="0"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set the credit amount directly. Only positive numbers and zero are allowed.
                </p>
                {creditsToEdit && !isNaN(Number(creditsToEdit)) && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {Number(creditsToEdit) > initialCredits ? (
                      <span className="text-green-600">Credits will increase from {initialCredits} to {Number(creditsToEdit)} (+{Number(creditsToEdit) - initialCredits})</span>
                    ) : Number(creditsToEdit) < initialCredits ? (
                      <span className="text-red-600">Credits will decrease from {initialCredits} to {Number(creditsToEdit)} (-{initialCredits - Number(creditsToEdit)})</span>
                    ) : (
                      <span className="text-gray-500">No change in credits (stays at {initialCredits})</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreditsModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCredits}
                  disabled={isUpdatingCredits || !creditsToEdit || isNaN(Number(creditsToEdit)) || Number(creditsToEdit) < 0}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingCredits ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Company Modal */}
      {showDeleteModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Company</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{selectedCompany.name}</strong>? This will:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Delete all company data</li>
                <li>• Remove all team members</li>
                <li>• Delete all tests and results</li>
                <li>• Remove all credits and transactions</li>
              </ul>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCompany}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Delete Company'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
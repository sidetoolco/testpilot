import { useState, useEffect } from 'react';
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

interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  credits?: number;
  user_count?: number;
  test_count?: number;
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

export default function CompaniesManagement() {
  const user = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsToAdd, setCreditsToAdd] = useState('');
  const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.user.id)
          .single();

        if (!error && data) {
          setIsAdmin(data.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user?.user?.id]);

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      if (!isAdmin) return;

      try {
        setLoading(true);
        
        // Get all companies with basic info
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });

        if (companiesError) throw companiesError;

        // Get additional data for each company
        const companiesWithDetails = await Promise.all(
          (companiesData || []).map(async (company: any) => {
            try {
              // Get user count
              const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', company.id);

              // Get test count
              const { count: testCount } = await supabase
                .from('tests')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', company.id);

              // Get credits for this company using the company-specific endpoint
              let companyCredits = 0;
              try {
                const { data: creditsData } = await apiClient.get(`/credits/company/${company.id}`);
                companyCredits = creditsData?.total || 0;
              } catch (error) {
                console.error('Error fetching credits for company:', company.id, error);
                companyCredits = 0;
              }

              return {
                ...company,
                user_count: userCount || 0,
                test_count: testCount || 0,
                credits: companyCredits,
              };
            } catch (error) {
              console.error('Error fetching details for company:', company.id, error);
              return {
                ...company,
                user_count: 0,
                test_count: 0,
                credits: 0,
              };
            }
          })
        );

        setCompanies(companiesWithDetails);
      } catch (error) {
        console.error('Error loading companies:', error);
        toast.error('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [isAdmin]);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = async (company: Company) => {
    try {
      // Get detailed company information
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      const { data: tests } = await supabase
        .from('tests')
        .select('id, name, status, created_at')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      setSelectedCompany({
        ...company,
        profiles: profiles || [],
        tests: tests || [],
      });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading company details:', error);
      toast.error('Failed to load company details');
    }
  };

  const handleAddCredits = async () => {
    if (!selectedCompany || !creditsToAdd || isNaN(Number(creditsToAdd))) {
      toast.error('Please enter a valid number of credits');
      return;
    }

    try {
      setIsUpdatingCredits(true);
      const credits = Number(creditsToAdd);

      // Add credits using the API
      await apiClient.post('/credits/admin/add', {
        company_id: selectedCompany.id,
        credits: credits,
        description: `Admin credit addition: +${credits} credits`
      });

      toast.success(`Added ${credits} credits to ${selectedCompany.name}`);
      setShowCreditsModal(false);
      setCreditsToAdd('');
      
      // Update the companies state to reflect the new credits
      setCompanies(prevCompanies => 
        prevCompanies.map(company => 
          company.id === selectedCompany.id 
            ? { ...company, credits: (company.credits || 0) + credits }
            : company
        )
      );
      
      // Update the selected company state as well
      setSelectedCompany(prev => 
        prev && prev.id === selectedCompany.id 
          ? { ...prev, credits: (prev.credits || 0) + credits }
          : prev
      );
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits. Please check if the admin credits endpoint exists.');
    } finally {
      setIsUpdatingCredits(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    try {
      setIsDeleting(true);

      // Delete company and all related data
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', selectedCompany.id);

      if (error) throw error;

      toast.success(`Deleted company: ${selectedCompany.name}`);
      setShowDeleteModal(false);
      setSelectedCompany(null);
      
      // Refresh companies list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    } finally {
      setIsDeleting(false);
    }
  };

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary-600" />
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
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(company)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedCompany(company as CompanyWithDetails);
                    setShowCreditsModal(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Credits</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedCompany(company as CompanyWithDetails);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCompanies.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search terms.' : 'No companies have been created yet.'}
          </p>
        </div>
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
                      {new Date(selectedCompany.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Updated</span>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedCompany.updated_at).toLocaleString()}
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
              <h2 className="text-xl font-bold text-gray-900">Add Credits</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Credits: {selectedCompany.credits || 0}
                </label>
              </div>

              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-2">
                  Credits to Add
                </label>
                <input
                  type="number"
                  id="credits"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter number of credits"
                  min="1"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreditsModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCredits}
                  disabled={isUpdatingCredits || !creditsToAdd || isNaN(Number(creditsToAdd))}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingCredits ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Add Credits'
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
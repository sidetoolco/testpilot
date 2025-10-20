import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import React from 'react';
import {
  Plus,
  Clock,
  CheckCircle,
  Pencil,
  Pause,
  X,
  Unlock,
  Lock,
} from 'lucide-react';
import { useTests } from '../features/tests/hooks/useTests';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useCredits } from '../features/credits/hooks/useCredits';
import { testService } from '../features/tests/services/testService';
import { PurchaseCreditsModal } from '../features/credits/components/PurchaseCreditsModal';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import ModalLayout from '../layouts/ModalLayout';
import apiClient, { updateTestBlock } from '../lib/api';
import { DEFAULT_ERROR_MSG } from '../lib/constants';
import SearchInput from '../components/ui/SearchInput';
import { useContinueTest } from '../features/tests/hooks/useContinueTest';
import { TestCost } from '../components/test-setup/TestCost';
import { StatisticsCards } from '../components/test-setup/StatisticsCards';
import { CreditIcon } from '../components/ui/CreditIcon';
import { useQueryClient } from '@tanstack/react-query';
import TestFilters from '../components/ui/TestFilters';
import { useAdmin } from '../hooks/useAdmin';

const CREDITS_PER_TESTER = 1;
const CREDITS_PER_TESTER_CUSTOM_SCREENING = 1.1;

interface Variation {
  id: string;
  name: string;
  title?: string;
  description?: string;
}

interface ConfirmationModal {
  isOpen: boolean;
  testId: string;
  test: {
    name: string;
    demographics: {
      testerCount: number;
      customScreening: {
        enabled?: boolean;
        question?: string;
        validAnswer?: 'Yes' | 'No';
      };
    };
    variations: Variation[];
  };
  variantsArray: Variation[];
}

interface ErrorModal {
  isOpen: boolean;
  message: string;
}

interface DeleteModal {
  isOpen: boolean;
  testId: string;
  testName: string;
}

const statusConfig = {
  complete: {
    bgColor: 'bg-[#E3F9F3]',
    textColor: 'text-[#00A67E]',
    icon: CheckCircle,
  },
  active: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-500',
    icon: Clock,
  },
  draft: {
    bgColor: 'bg-[#FEF6E6]',
    textColor: 'text-[#eabd31]',
    icon: Pencil,
  },
  incomplete: {
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-500',
    icon: Pause,
  },
  'in progress': {
    bgColor: 'bg-gray-300',
    textColor: 'text-gray-600',
    icon: Clock,
  },
};

export default function MyTests() {
  const navigate = useNavigate();
  const { tests, loading, updateTest } = useTests();
  const user = useAuth();
  const { data: creditsData, isLoading: creditsLoading } = useCredits();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdmin();
  const [publishingTests, setPublishingTests] = useState<string[]>([]);
  const [gettingDataTests, setGettingDataTests] = useState<string[]>([]);
  const [deletingTests, setDeletingTests] = useState<string[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal | null>(null);
  const [errorModal, setErrorModal] = useState<ErrorModal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const { continueTest } = useContinueTest();
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [deletedTestIds, setDeletedTestIds] = useState<string[]>([]);
  const [unblockingTests, setUnblockingTests] = useState<string[]>([]);
  const [blockingTests, setBlockingTests] = useState<string[]>([]);

  // Filter states
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [blockedFilter, setBlockedFilter] = useState<'all' | 'blocked' | 'unblocked'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  // Calculate credits needed for a test
  const calculateTestCredits = (test: any) => {
    const variantsArray = [test.variations.a, test.variations.b, test.variations.c].filter(v => v);
    const totalTesters = test.demographics.testerCount * variantsArray.length;
    const hasCustomScreening = test.demographics.customScreening?.enabled && 
      test.demographics.customScreening.question && 
      test.demographics.customScreening.validAnswer;
    const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
    return totalTesters * creditsPerTester;
  };

  const handlePublishConfirm = async () => {
    if (!confirmationModal) return;

    const totalTesters =
      confirmationModal.test.demographics.testerCount * confirmationModal.variantsArray.length;
    const hasCustomScreening =
      confirmationModal.test.demographics.customScreening?.enabled &&
      confirmationModal.test.demographics.customScreening.question &&
      confirmationModal.test.demographics.customScreening.validAnswer;
    const creditsPerTester = hasCustomScreening
      ? CREDITS_PER_TESTER_CUSTOM_SCREENING
      : CREDITS_PER_TESTER;
    const totalCredits = totalTesters * creditsPerTester;

    // Only proceed if credits data is available
    if (!creditsData) {
      toast.error('Unable to verify credit balance. Please try again.');
      return;
    }

    const availableCredits = creditsData.total || 0;

    if (availableCredits < totalCredits) {
      const creditsNeeded = totalCredits - availableCredits;
      toast.error(
        `Insufficient credits. You need ${creditsNeeded.toFixed(1)} more credits to publish this test.`
      );
      return;
    }

    const { testId } = confirmationModal;
    setPublishingTests(prev => [...prev, testId]);
    setConfirmationModal(null);

    try {
      // Publish the test (backend handles credit deduction automatically)
      await apiClient.post(`/tests/${testId}/publish`);

      // Refresh credits cache to show updated balance
      await queryClient.invalidateQueries({ queryKey: ['credits'] });

      // Update the test status in the local state to show as active
      updateTest(testId, { status: 'active' });

      toast.success('Test published successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || DEFAULT_ERROR_MSG;
      toast.error(errorMessage);
      setErrorModal({ isOpen: true, message: errorMessage });
    } finally {
      setPublishingTests(prev => prev.filter(id => id !== testId));
    }
  };

  const handleGetData = async (testId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGettingDataTests(prev => [...prev, testId]);

    try {
      const accessToken = user?.session?.access_token;
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Use the configured API client instead of hardcoded URL
      const isDevelopment = import.meta.env.DEV;
      const apiUrl = isDevelopment 
        ? `/api/insights/${testId}`  // Use Vite proxy in development
        : `${import.meta.env.VITE_API_URL || 'https://tespilot-api-301794542770.us-central1.run.app'}/insights/${testId}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Open new window with the response data
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(`
          <html>
            <head>
              <title>Test Data - ${testId}</title>
              <style>
                body { 
                  font-family: monospace;
                  white-space: pre-wrap;
                  padding: 20px;
                  background: #f5f5f5;
                }
              </style>
            </head>
            <body>
              ${JSON.stringify(data, null, 2)}
            </body>
          </html>
        `);
        newWindow.document.close();
      }

      toast.success('Test data retrieved successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to get test data. Please try again.'
      );
    } finally {
      setGettingDataTests(prev => prev.filter(id => id !== testId));
    }
  };

  const handlePublish = (testId: string, e: React.MouseEvent, test: any) => {
    e.stopPropagation();
    const variantsArray = [test.variations.a, test.variations.b, test.variations.c].filter(v => v);

    setConfirmationModal({ isOpen: true, testId, test, variantsArray });
  };





  // Nueva función para manejar la continuación de tests incompletos
  const handleContinueTest = async (testId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active el onClick del contenedor

    const result = await continueTest(testId);

    if (result) {
      // Navegar directamente a /create-test con los datos del test incompleto
      navigate('/create-test', {
        state: {
          testData: result.testData,
          testId: result.testId,
          isIncompleteTest: true,
          currentStep: result.currentStep,
        },
      });
    }
  };

  // Delete test using frontend service with cascade deletion
  const handleDeleteTest = async (testId: string, testName: string) => {
    setDeletingTests(prev => [...prev, testId]);

    try {
      // Use the frontend testService with cascade deletion logic
      await testService.deleteTest(testId);

      // If successful, show success message
      toast.success(`Test "${testName}" deleted successfully`);

      // Add the test ID to the deleted list to hide it from UI
      setDeletedTestIds(prev => [...prev, testId]);

      // Close the modal
      setDeleteModal(null);
    } catch (error: any) {
      console.error('Error deleting test:', error);
      
      // Handle specific error responses
      if (error.message?.includes('Test not found')) {
        toast.error('Test not found');
      } else if (error.message?.includes('Unauthorized')) {
        toast.error('Unauthorized');
      } else {
        toast.error(error.message || 'Failed to delete test. Please try again.');
      }
    } finally {
      setDeletingTests(prev => prev.filter(id => id !== testId));
    }
  };

  // Handle unblocking a test
  const handleUnblockTest = async (testId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnblockingTests(prev => [...prev, testId]);

    try {
      await updateTestBlock(testId, false);
      toast.success('Test unblocked successfully');
      
      // Update the local tests state immediately
      updateTest(testId, { block: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to unblock test';
      toast.error(errorMessage);
    } finally {
      setUnblockingTests(prev => prev.filter(id => id !== testId));
    }
  };

  // Handle blocking a test
  const handleBlockTest = async (testId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBlockingTests(prev => [...prev, testId]);

    try {
      await updateTestBlock(testId, true);
      toast.success('Test blocked successfully');
      
      // Update the local tests state immediately
      updateTest(testId, { block: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to block test';
      toast.error(errorMessage);
    } finally {
      setBlockingTests(prev => prev.filter(id => id !== testId));
    }
  };

  // Helper function to check if a test can be deleted
  const canDeleteTest = (testStatus: string) => {
    return ['draft', 'needs review', 'incomplete'].includes(testStatus);
  };

  // Filtrar tests basado en la búsqueda
  const filteredTests = useMemo(() => {
    let filtered = tests.filter(test => !deletedTestIds.includes(test.id));

    // Text search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        test =>
          test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.searchTerm.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Company filter
    if (companyFilter && isAdmin) {
      filtered = filtered.filter(test => {
        const company = (test.companyName ?? '').toLowerCase();
        return company.includes(companyFilter.toLowerCase());
      });
    }

    // Blocked status filter
    if (blockedFilter !== 'all') {
      filtered = filtered.filter(test => {
        if (blockedFilter === 'blocked') return test.block === true;
        if (blockedFilter === 'unblocked') return test.block === false;
        return true;
      });
    }

    // Test status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(test => test.status === statusFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      let cutoff: number | null = null;

      switch (timeFilter) {
        case 'today': {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          cutoff = startOfToday.getTime();
          break;
        }
        case 'week':
          cutoff = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          cutoff = now - 30 * 24 * 60 * 60 * 1000;
          break;
        case 'year':
          cutoff = now - 365 * 24 * 60 * 60 * 1000;
          break;
      }

      if (cutoff !== null) {
        filtered = filtered.filter(test => new Date(test.createdAt).getTime() >= cutoff!);
      }
    }

    return filtered;
  }, [tests, searchQuery, deletedTestIds, companyFilter, blockedFilter, statusFilter, timeFilter, isAdmin]);

  // Calculate statistics with memoization
  const { activeTests, completedTests } = useMemo(() => {
    const active = tests.filter(
      s => s.status === 'active' && !deletedTestIds.includes(s.id)
    ).length;
    const completed = tests.filter(
      s => s.status === 'complete' && !deletedTestIds.includes(s.id)
    ).length;
    
    return { activeTests: active, completedTests: completed };
  }, [tests, deletedTestIds]);

  if (loading) {
    return (
      <div className="mx-auto px-8 py-6 w-full">
        <div className="min-h-screen bg-[#f9fcfa] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-[2rem] sm:text-[2.5rem] text-[#1B1B1B] font-normal">My Tests</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/create-test')}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-[#0a0a29de] text-white rounded-xl hover:bg-[#1a1a3a] transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Test</span>
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards
        activeTests={activeTests}
        completedTests={completedTests}
        availableCredits={creditsData?.total || 0}
        creditsLoading={creditsLoading}
      />

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 min-w-0">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tests by name or search term..."
          />
        </div>
        <TestFilters
          companyFilter={companyFilter}
          setCompanyFilter={setCompanyFilter}
          blockedFilter={blockedFilter}
          setBlockedFilter={setBlockedFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          isAdmin={isAdmin}
        />
      </div>

      {/* Filter Summary */}
      {(companyFilter || blockedFilter !== 'all' || statusFilter !== 'all' || timeFilter !== 'all') && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <span className="font-medium">Active Filters:</span>
            {companyFilter && (
              <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">
                Company: {companyFilter}
              </span>
            )}
            {blockedFilter !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">
                Blocked: {blockedFilter === 'blocked' ? 'Yes' : 'No'}
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </span>
            )}
            {timeFilter !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">
                Created: {timeFilter === 'today' ? 'Today' : 
                          timeFilter === 'week' ? 'This Week' : 
                          timeFilter === 'month' ? 'This Month' : 'This Year'}
              </span>
            )}
            <span className="text-blue-600">
              ({filteredTests.length} of {tests.filter(test => !deletedTestIds.includes(test.id)).length} tests)
            </span>
          </div>
        </div>
      )}

      {/* Test List */}
      <div className="space-y-4">
        {filteredTests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            {searchQuery || companyFilter || blockedFilter !== 'all' || statusFilter !== 'all' || timeFilter !== 'all' ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                <p className="text-gray-500 mb-4">
                  No tests match your current filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCompanyFilter('');
                    setBlockedFilter('all');
                    setStatusFilter('all');
                    setTimeFilter('all');
                  }}
                  className="px-6 py-3 bg-primary-400 text-white rounded-xl hover:bg-primary-500"
                >
                  Clear All Filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests yet</h3>
                <p className="text-gray-500 mb-4">Create your first test to get started</p>
                <button
                  onClick={() => navigate('/create-test')}
                  className="px-6 py-3 bg-primary-400 text-white rounded-xl hover:bg-primary-500"
                >
                  Create New Test
                </button>
              </>
            )}
          </div>
        ) : (
          filteredTests.map(test => {
            const config =
              statusConfig[test.status as keyof typeof statusConfig] || statusConfig.incomplete;
            const StatusIcon = config.icon;
            const testCredits = calculateTestCredits(test);
            const isActive = test.status === 'active';
            const isBlocking = test.block;
            const isCompleteBlocked = test.status === 'complete' && test.block;
            const isCompleteBlockedForNonAdmin = isCompleteBlocked && !isAdmin;

            return (
              <motion.div
                key={test.id}
                className={`bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all relative ${
                  isCompleteBlockedForNonAdmin ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (isCompleteBlockedForNonAdmin) {
                    return; // Prevent navigation for blocked tests (only for non-admins)
                  }
                  navigate(`/tests/${test.id}`);
                }}
                whileHover={{ y: -2 }}
              >


                {/* Delete button for deletable tests */}
                {canDeleteTest(test.status) && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setDeleteModal({ isOpen: true, testId: test.id, testName: test.name });
                    }}
                    disabled={deletingTests.includes(test.id)}
                    className="absolute top-1 left-2 z-20 text-gray-200"
                    title="Delete test"
                  >
                    {deletingTests.includes(test.id) ? (
                      <div className="w-4 h-4 text-gray-400 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <X className="h-5 w-5 text-gray-500 bg-white rounded-full hover:text-red-500 transition-colors" />
                    )}
                  </button>
                )}

                <div className={`flex flex-col sm:grid sm:grid-cols-[minmax(300px,1fr),180px,200px] gap-4 ${
                  isCompleteBlockedForNonAdmin ? 'blur-[2px] opacity-60' : ''
                }`}>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      {isCompleteBlocked ? (
                        <Lock className={`h-6 w-6 text-sky-500`} />
                      ) : (
                        <StatusIcon className={`h-6 w-6 ${config.textColor}`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-[#1B1B1B] truncate">{test.name}</h3>
                        {/* Company name for admin users */}
                        {isAdmin && test.companyName && (
                          <>
                            <span className="text-gray-400">-</span>
                            <span className="text-sm text-gray-600 font-medium">{test.companyName}</span>
                          </>
                        )}
                        {/* Credit cost display */}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="truncate">Search term: {test.searchTerm}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className={config.textColor}>
                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </span>
                        {test.skin && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className={`font-medium ${test.skin === 'walmart' ? 'text-blue-600' : 'text-orange-600'}`}>
                              {test.skin.charAt(0).toUpperCase() + test.skin.slice(1)}
                            </span>
                          </>
                        )}
                        {test.status === 'complete' && isAdmin && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className={isBlocking ? 'text-orange-500' : 'text-sky-500'}>
                              {isBlocking ? 'Blocked' : 'Unblocked'}
                            </span>
                          </>
                        )}
                        {test.status !== 'complete' && test.status !== 'active' && (
                          <>
                            <span className="hidden sm:inline">-</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <CreditIcon size={14} />
                              <span>{testCredits.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 sm:text-center">
                    {new Date(test.createdAt).toLocaleDateString()}
                    {isAdmin && (
                      <>
                        
                        <button
                          className="text-blue-500 text-md font-semibold px-2 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={e => handleGetData(test.id, e)}
                          disabled={gettingDataTests.includes(test.id)}
                          aria-busy={gettingDataTests.includes(test.id)}
                        >
                          {gettingDataTests.includes(test.id) ? 'Getting Data...' : 'Get Data'}
                        </button>
                      </>
                    )}
                  </div>
                  {test.status === 'incomplete' ? (
                    <div className="flex items-center sm:justify-end">
                      <button
                        onClick={e => handleContinueTest(test.id, e)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                      >
                        Continue
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 sm:justify-end">
                      {/* Admin-only buttons */}
                      {isAdmin && (
                        <>
                          {test.status === 'complete' && (
                            <button
                              onClick={e => isBlocking ? handleUnblockTest(test.id, e) : handleBlockTest(test.id, e)}
                              disabled={blockingTests.includes(test.id) || unblockingTests.includes(test.id)}
                              className={`px-4 py-2 text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                                isBlocking 
                                  ? 'bg-sky-500 hover:bg-sky-600' 
                                  : 'bg-orange-500 hover:bg-orange-600'
                              } ${
                                (blockingTests.includes(test.id) || unblockingTests.includes(test.id))
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              {(blockingTests.includes(test.id) || unblockingTests.includes(test.id)) ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  {unblockingTests.includes(test.id) ? 'Unblocking...' : 'Blocking...'}
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  {isBlocking ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                  <span>{isBlocking ? 'Unblock' : 'Block'}</span>
                                </span>
                              )}
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* Publish button - available for all users */}
                      {test.status === 'draft' && (
                        <button
                          onClick={e => handlePublish(test.id, e, test)}
                          disabled={publishingTests.includes(test.id)}
                          className={`px-4 py-2 bg-green-500 text-white rounded-lg transition-colors ${
                            publishingTests.includes(test.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-green-600'
                          }`}
                        >
                          {publishingTests.includes(test.id) ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Publishing...
                            </span>
                          ) : (
                            'Publish'
                          )}
                        </button>
                      )}
                      

                      

                    </div>
                  )}
                </div>

                {/* Block message for complete blocked tests - positioned within the card (only for non-admins) */}
                {isCompleteBlockedForNonAdmin && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none ">
                                         <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 text-center max-w-xl shadow-lg ">
                       <p className="text-gray-800 font-semibold mb-2 text-lg">🎉 Your Test is Almost Ready!</p>
                       <p className="text-gray-600 text-sm leading-relaxed">Great news! Your test is in the final stages. We're just waiting for the last few testers to complete their sessions. Your results will be available shortly.</p>
                     </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmationModal &&
        (() => {
          // Calculate credits needed for this test
          const totalTesters =
            confirmationModal.test.demographics.testerCount *
            confirmationModal.variantsArray.length;
          const hasCustomScreening =
            confirmationModal.test.demographics.customScreening?.enabled &&
            confirmationModal.test.demographics.customScreening.question &&
            confirmationModal.test.demographics.customScreening.validAnswer;
          const creditsPerTester = hasCustomScreening
            ? CREDITS_PER_TESTER_CUSTOM_SCREENING
            : CREDITS_PER_TESTER;
          const totalCredits = totalTesters * creditsPerTester;

          // Only calculate if credits data is available
          const availableCredits = creditsData?.total || 0;
          const hasSufficientCredits = !creditsLoading && availableCredits >= totalCredits;
          const creditsNeeded = Math.max(0, totalCredits - availableCredits);

          return (
            <ModalLayout
              isOpen={confirmationModal.isOpen}
              onClose={() => setConfirmationModal(null)}
              title="Confirm Publication"
            >
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Are you sure you want to publish the test "{confirmationModal.test.name}"?
                </p>
                <p className="text-gray-500 text-sm">
                  {totalTesters} testers will be invited to participate in the test.
                </p>

                {/* Credit Information */}
                <TestCost
                  totalTesters={totalTesters}
                  creditsPerTester={creditsPerTester}
                  totalCredits={totalCredits}
                  availableCredits={availableCredits}
                  creditsLoading={creditsLoading}
                  hasSufficientCredits={hasSufficientCredits}
                  creditsNeeded={creditsNeeded}
                  onPurchaseCredits={() => setIsPurchaseModalOpen(true)}
                  size="small"
                  showAvailableCredits={true}
                  showInsufficientWarning={true}
                />            

                <p className="text-sm text-gray-500 mt-4">
                  This action will make the test available on Prolific.
                </p>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setConfirmationModal(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePublishConfirm}
                    disabled={!hasSufficientCredits}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      hasSufficientCredits
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {hasSufficientCredits ? 'Confirm Publication' : 'Insufficient Credits'}
                  </button>
                </div>
              </div>
            </ModalLayout>
          );
        })()}

      {/* Error Modal */}
      {errorModal && (
        <ModalLayout isOpen={errorModal.isOpen} onClose={() => setErrorModal(null)} title="Error">
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-900 mb-2">Failed to publish test</p>
            <p className="text-gray-500 text-sm">{errorModal.message}</p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setErrorModal(null)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </ModalLayout>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <ModalLayout
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal(null)}
          title="Confirm Deletion"
        >
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Are you sure you want to delete the test "{deleteModal.testName}"?
            </p>
            <p className="text-gray-500 text-sm">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteModal) {
                    handleDeleteTest(deleteModal.testId, deleteModal.testName);
                  }
                }}
                disabled={deletingTests.includes(deleteModal?.testId || '')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingTests.includes(deleteModal?.testId || '') ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  'Delete Test'
                )}
              </button>
            </div>
          </div>
        </ModalLayout>
      )}

      {/* Purchase Credits Modal */}
      <Elements stripe={stripePromise}>
        <PurchaseCreditsModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          creditsNeeded={
            confirmationModal
              ? (() => {
                  const totalTesters =
                    confirmationModal.test.demographics.testerCount *
                    confirmationModal.variantsArray.length;
                  const hasCustomScreening =
                    confirmationModal.test.demographics.customScreening?.enabled &&
                    confirmationModal.test.demographics.customScreening.question &&
                    confirmationModal.test.demographics.customScreening.validAnswer;
                  const creditsPerTester = hasCustomScreening
                    ? CREDITS_PER_TESTER_CUSTOM_SCREENING
                    : CREDITS_PER_TESTER;
                  const totalCredits = totalTesters * creditsPerTester;

                  // Only calculate if credits data is available and not loading
                  if (creditsLoading || !creditsData) return undefined;
                  const availableCredits = creditsData.total || 0;
                  return Math.max(0, totalCredits - availableCredits);
                })()
              : undefined
          }
        />
      </Elements>
    </div>
  );
}

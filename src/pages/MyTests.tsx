import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  PlayCircle,
  Users2,
  Clock,
  CheckCircle,
  Pencil,
  Play,
  Pause,
  FileText,
  TrendingUp,
  Calendar,
  BarChart3,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { useTests } from '../features/tests/hooks/useTests';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useCredits } from '../features/credits/hooks/useCredits';
import { PurchaseCreditsModal } from '../features/credits/components/PurchaseCreditsModal';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import ModalLayout from '../layouts/ModalLayout';
import apiClient from '../lib/api';
import { DEFAULT_ERROR_MSG } from '../lib/constants';
import SearchInput from '../components/ui/SearchInput';
import { useContinueTest } from '../features/tests/hooks/useContinueTest';

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
  const { tests, loading } = useTests();
  const user = useAuth();
  const { data: creditsData, isLoading: creditsLoading } = useCredits();
  const [isAdmin, setIsAdmin] = useState(false);
  const [publishingTests, setPublishingTests] = useState<string[]>([]);
  const [gettingDataTests, setGettingDataTests] = useState<string[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal | null>(null);
  const [errorModal, setErrorModal] = useState<ErrorModal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const { continueTest } = useContinueTest();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.user.id)
        .single();

      if (!error && data) {
        setIsAdmin(data.role === 'admin');
      }
    };

    checkAdminRole();
  }, [user?.user?.id]);

  const handlePublishConfirm = async () => {
    if (!confirmationModal) return;

    // Double-check credits before publishing
    const totalTesters = confirmationModal.test.demographics.testerCount * confirmationModal.variantsArray.length;
    const hasCustomScreening = !!confirmationModal.test.demographics.customScreening.question;
    const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
    const totalCredits = totalTesters * creditsPerTester;
    const availableCredits = creditsData?.total || 0;

    if (availableCredits < totalCredits) {
      const creditsNeeded = totalCredits - availableCredits;
      toast.error(`Insufficient credits. You need ${creditsNeeded.toFixed(1)} more credits to publish this test.`);
      return;
    }

    const { testId } = confirmationModal;
    setPublishingTests(prev => [...prev, testId]);
    setConfirmationModal(null);

    try {
      await apiClient.post(`/tests/${testId}/publish`);

      toast.success('Test published successfully');
    } catch (error: any) {
      console.error('Error publishing test:', error);
      const errorMessage = error.response?.data?.message || DEFAULT_ERROR_MSG;
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
      const apiUrl = `https://tespilot-api-301794542770.us-central1.run.app/insights/${testId}`;
      console.log('Making request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Open new window with the response data
      const newWindow = window.open('', '_blank');
      if (newWindow) {
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
      console.error('Error getting test data:', error);
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

  // Filtrar tests basado en la búsqueda
  const filteredTests = useMemo(() => {
    if (!searchQuery.trim()) return tests;

    return tests.filter(
      test =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.searchTerm.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tests, searchQuery]);

  // Calculate statistics
  const activeTests = tests.filter(s => s.status === 'active').length;
  const completedTests = tests.filter(s => s.status === 'complete').length;

  if (loading) {
    return (
      <div className="mx-auto px-8 py-6 w-full">
        <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
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
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-[#0A0A29] text-white rounded-xl hover:bg-[#1a1a3a] transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Test</span>
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
              <PlayCircle className="h-7 w-7 text-[#00A67E]" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900">Active Tests</h3>
              <p className="text-4xl font-semibold text-[#00A67E] mt-1">{activeTests}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#F0F7FF] to-[#F8FAFF] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-[#2E90FA] bg-opacity-10 rounded-full flex items-center justify-center">
              <Users2 className="h-7 w-7 text-[#2E90FA]" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900">Completed Tests</h3>
              <p className="text-4xl font-semibold text-[#2E90FA] mt-1">{completedTests}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search tests by name or search term..."
      />

      {/* Test List */}
      <div className="space-y-4">
        {filteredTests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            {searchQuery ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                <p className="text-gray-500 mb-4">
                  No tests match your search criteria "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-primary-400 text-white rounded-xl hover:bg-primary-500"
                >
                  Clear Search
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
            const config = statusConfig[test.status as keyof typeof statusConfig];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={test.id}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/tests/${test.id}`)}
                whileHover={{ y: -2 }}
              >
                <div className="flex flex-col sm:grid sm:grid-cols-[minmax(300px,1fr),180px,200px] gap-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <StatusIcon className={`h-6 w-6 ${config.textColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-medium text-[#1B1B1B] truncate">{test.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="truncate">Search term: {test.searchTerm}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className={config.textColor}>
                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 sm:text-center">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </div>
                  {(test.status as any) === 'incomplete' ? (
                    <div className="flex items-center sm:justify-end">
                      <button
                        onClick={e => handleContinueTest(test.id, e)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                      >
                        Continue
                      </button>
                    </div>
                  ) : (
                    isAdmin && (
                      <div className="flex items-center gap-4 sm:justify-end">
                        <button
                          onClick={e => handleGetData(test.id, e)}
                          disabled={gettingDataTests.includes(test.id)}
                          className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap ${
                            gettingDataTests.includes(test.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-blue-600'
                          }`}
                        >
                          {gettingDataTests.includes(test.id) ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Getting Data...
                            </span>
                          ) : (
                            'Get Data'
                          )}
                        </button>
                        {test.status !== 'complete' && (
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
                    )
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmationModal && (() => {
        // Calculate credits needed for this test
        const totalTesters = confirmationModal.test.demographics.testerCount * confirmationModal.variantsArray.length;
        const hasCustomScreening = !!confirmationModal.test.demographics.customScreening.question;
        const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
        const totalCredits = totalTesters * creditsPerTester;
        const availableCredits = creditsData?.total || 0;
        const hasSufficientCredits = availableCredits >= totalCredits;
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
              <div className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-[#00A67E]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Test Cost</h4>
                      <p className="text-xs text-gray-500">
                        {totalTesters} testers × {creditsPerTester} credit{creditsPerTester !== 1 ? 's' : ''} per tester
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-gray-900">{totalCredits.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Credits</div>
                  </div>
                </div>

                {/* Available Credits */}
                <div className="bg-white rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Available Credits</p>
                      <p className="text-lg font-bold text-gray-900">
                        {creditsLoading ? '...' : availableCredits.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {hasSufficientCredits ? (
                        <div className="flex items-center text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium">Sufficient</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Insufficient</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Insufficient Credits Warning */}
                {!hasSufficientCredits && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-red-800 mb-1">Insufficient Credits</h5>
                        <p className="text-sm text-red-700 mb-3">
                          You need {creditsNeeded.toFixed(1)} more credits to publish this test.
                        </p>
                        <button
                          onClick={() => setIsPurchaseModalOpen(true)}
                          className="inline-flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Buy More Credits</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Screening Indicator */}
                {hasCustomScreening && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-800">
                        Custom screening enabled (+0.1 credit per tester)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {confirmationModal.variantsArray.map((variation: Variation, index: number) => (
                    <div key={variation.id} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
                          {variation.title || `Variation ${index + 1}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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

      {/* Purchase Credits Modal */}
      <Elements stripe={stripePromise}>
        <PurchaseCreditsModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          creditsNeeded={confirmationModal ? (() => {
            const totalTesters = confirmationModal.test.demographics.testerCount * confirmationModal.variantsArray.length;
            const hasCustomScreening = !!confirmationModal.test.demographics.customScreening.question;
            const creditsPerTester = hasCustomScreening ? CREDITS_PER_TESTER_CUSTOM_SCREENING : CREDITS_PER_TESTER;
            const totalCredits = totalTesters * creditsPerTester;
            const availableCredits = creditsData?.total || 0;
            return Math.max(0, totalCredits - availableCredits);
          })() : undefined}
        />
      </Elements>
    </div>
  );
}

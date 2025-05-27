import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, PlayCircle, Users2, Clock, CheckCircle, X } from 'lucide-react';
import { useTests } from '../features/tests/hooks/useTests';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import ModalLayout from '../layouts/ModalLayout';

interface Variation {
  id: string;
  name: string;
  description?: string;
}

interface ConfirmationModal {
  isOpen: boolean;
  testId: string;
  test: {
    name: string;
    demographics: {
      testerCount: number;
    };
    variations: Variation[];
  };
  variantsArray: Variation[];
}

export default function MyTests() {
  const navigate = useNavigate();
  const { tests, loading } = useTests();
  const user = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [publishingTests, setPublishingTests] = useState<string[]>([]);
  const [gettingDataTests, setGettingDataTests] = useState<string[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal | null>(null);

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

    const { testId, test } = confirmationModal;
    setPublishingTests(prev => [...prev, testId]);
    setConfirmationModal(null);

    try {
      const response = await fetch(
        'https://testpilot.app.n8n.cloud/webhook-test/publish-prolific',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ testId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish test');
      }
      toast.success('Test published successfully');
    } catch (error) {
      console.error('Error publishing test:', error);
      toast.error('Failed to publish test. Please try again.');
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

      {/* Test List */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tests yet</h3>
            <p className="text-gray-500 mb-4">Create your first test to get started</p>
            <button
              onClick={() => navigate('/create-test')}
              className="px-6 py-3 bg-primary-400 text-white rounded-xl hover:bg-primary-500"
            >
              Create New Test
            </button>
          </div>
        ) : (
          tests.map(test => (
            <motion.div
              key={test.id}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/tests/${test.id}`)}
              whileHover={{ y: -2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full ${test.status === 'complete' ? 'bg-[#E3F9F3]' : 'bg-blue-50'} flex items-center justify-center`}
                  >
                    {test.status === 'complete' ? (
                      <CheckCircle className="h-6 w-6 text-[#00A67E]" />
                    ) : (
                      <Clock className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#1B1B1B]">{test.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span>Search term: {test.searchTerm}</span>
                      <span className="hidden sm:inline">•</span>
                      <span
                        className={`${test.status === 'complete' ? 'text-[#00A67E]' : 'text-blue-500'}`}
                      >
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-500">{new Date(test.createdAt).toLocaleDateString()}</div>
                {isAdmin && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={e => handleGetData(test.id, e)}
                      disabled={gettingDataTests.includes(test.id)}
                      className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors ${
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
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmationModal && (
        <ModalLayout
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(null)}
          title="Confirm Publication"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to publish the test "{confirmationModal.test.name}"?
            </p>
            <p className="text-gray-600">
              {confirmationModal.test.demographics.testerCount *
                confirmationModal.variantsArray.length}{' '}
              testers will be invited to participate in the test.
            </p>

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
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Confirm Publication
              </button>
            </div>
          </div>
        </ModalLayout>
      )}
    </div>
  );
}

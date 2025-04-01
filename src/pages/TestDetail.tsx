import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTestDetail } from '../features/tests/hooks/useTestDetail';
import { getIaInsight } from '../features/tests/components/Report/services/dataInsightService';
import { useInsightStore } from '../features/tests/hooks/useIaInsight';
import Report from '../features/tests/components/Report/ReportMain';

export default function TestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { test: testInfo, loading, error: testError } = useTestDetail(id || '');
  const { loading: insightLoading, setInsight, setLoading } = useInsightStore();
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (testInfo && id) {
      setLoading(true);
      setError(null);
      getIaInsight(id, testInfo)
        .then((data) => {
          setInsight(data);
        })
        .catch((err) => {
          setError('Failed to load insights. Please try again later.');
          console.error('Error loading insights:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, testInfo, setInsight, setLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(loading || insightLoading);
    }, 300);

    return () => clearTimeout(timer);
  }, [loading, insightLoading]);

  if (testError) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Error loading test</h2>
          <p className="text-gray-600 mb-4">{testError}</p>
          <button
            onClick={() => navigate('/my-tests')}
            className="text-primary-400 hover:text-primary-500 hover:underline"
          >
            Return to tests
          </button>
        </div>
      </div>
    );
  }

  if (showLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <div className="inline-flex relative w-16 h-16">
              <div className="absolute w-16 h-16 border-4 border-primary-100 rounded-full"></div>
              <div className="absolute w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-800">Analyzing your test results</h3>
              {insightLoading ? (
                <p className="text-primary-500 text-sm font-medium">
                  Bringing powerful insights to you...
                </p>
              ) : (
                <p className="text-primary-500/50 text-sm font-medium">
                  Loading test data...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!testInfo) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Test not found</h2>
          <button
            onClick={() => navigate('/my-tests')}
            className="text-primary-400 hover:text-primary-500 hover:underline"
          >
            Return to tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#FFF8F8] flex flex-col">
      <div className="flex-1 mx-auto w-full overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 py-6 h-[100vh]">
          <button
            onClick={() => navigate('/my-tests')}
            className="mb-6 px-4 py-2 flex items-center gap-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
            <span className="font-medium">Back to tests</span>
          </button>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          <Report variant={testInfo} />
        </div>
      </div>
    </div>
  );
}
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTestDetail } from '../features/tests/hooks/useTestDetail';
import Report from '../features/tests/components/Report/Report';
import { getIaInsight } from '../features/tests/components/Report/services/dataInsightService';
import { useInsightStore } from '../features/tests/hooks/useIaInsight';

export default function TestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { test: testInfo, loading } = useTestDetail(id || '');
  const { insight, loading: insightLoading, setInsight, setLoading } = useInsightStore();

  useEffect(() => {
    if (testInfo && id) {
      setLoading(true);
      getIaInsight(id || '', testInfo)
        .then((data: any) => {
          setInsight(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id, testInfo]);

  const isInsightLoading = testInfo && insightLoading;
  console.log(insight, 'insight', loading, 'loading', insightLoading, 'insightLoading');

  if (loading || isInsightLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
          {isInsightLoading && <p className="mt-4 text-primary-400 animate-pulse">Loading insights...</p>}
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
          <Report variant={testInfo} />
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import ReportContent from './ReportContent';
import ReportPDF from './ReportPDF';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import {
  getSummaryData,
  checkIdInIaInsights,
  getAveragesurveys,
  getCompetitiveInsights,
} from './services/dataInsightService';
import { useTestDetail } from '../../hooks/useTestDetail';
import { useInsightStore } from '../../hooks/useIaInsight';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';

interface ReportProps {
  id: string;
}

interface ReportTabsProps {
  activeTab: string;
  onTabChange: (tab: string, userEmail: string) => void;
  variantStatus: string;
}

const TABS = [
  'test-details',
  'summary',
  'purchase-drivers',
  'competitive-insights',
  'shopper-comments',
  'recommendations',
];

const ReportTabs: React.FC<ReportTabsProps> = ({ activeTab, onTabChange, variantStatus }) => {
  const { user } = useAuth();
  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <nav className="flex gap-1 min-w-max pb-1">
        {TABS.map(tab => {
          const isDisabled =
            variantStatus === 'draft' &&
            tab !== 'test-details' &&
            user?.email !== 'barb@testerson.com';
          return (
            <button
              key={tab}
              className={clsx(
                'py-2 px-2 sm:px-3 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base',
                activeTab === tab
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent hover:border-gray-300',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !isDisabled && onTabChange(tab, user?.email || '')}
              disabled={isDisabled}
            >
              {tab.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const Report: React.FC<ReportProps> = ({ id }) => {
  const { test: testInfo, loading, error: testError } = useTestDetail(id || '');
  const { insight, loading: insightLoading, setInsight, setLoading } = useInsightStore();
  const [activeTab, setActiveTab] = useState('test-details');
  const [isPrinting, setIsPrinting] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [averagesurveys, setAveragesurveys] = useState<any>(null);
  const [competitiveinsights, setCompetitiveinsights] = useState<any>(null);

  const navigate = useNavigate();

  // Función para convertir Test a TestDetails de forma segura
  const convertTestToTestDetails = (test: any): any => {
    return {
      ...test,
      objective: test.objective || '', // Asegurar que objective no sea undefined
      updatedAt: test.updatedAt || test.createdAt, // Usar createdAt como fallback
    };
  };

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (!testInfo) return;
      
      try {
        setLoading(true);
        
        console.log('Starting data fetch for test:', testInfo.id);
        
        const [existingInsights, data, averagesurveys, competitiveinsights] = await Promise.all([
          checkIdInIaInsights(id),
          getSummaryData(id),
          getAveragesurveys(id),
          getCompetitiveInsights(id)
        ]);

        console.log('Data fetched successfully:', {
          insights: !!existingInsights,
          summaryData: !!data,
          averagesurveys: !!averagesurveys,
          competitiveinsights: !!competitiveinsights
        });

        setSummaryData(data);
        setAveragesurveys(averagesurveys);
        setCompetitiveinsights(competitiveinsights);
        setInsight(existingInsights);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummaryData();
  }, [testInfo, id, setInsight, setLoading]);

  useEffect(() => {
    const observerOptions = {
      root: document.getElementById('report-content'),
      rootMargin: '0px',
      threshold: 0.5,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      if (isPrinting) return; // Prevent tab changes while printing

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const tabName = sectionId.replace('content-', '');
          setActiveTab(tabName);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Only observe sections if not printing
    if (!isPrinting) {
      const sections = document.querySelectorAll('[id^="content-"]');
      sections.forEach(section => observer.observe(section));

      return () => {
        sections.forEach(section => observer.unobserve(section));
      };
    }
  }, [isPrinting]); // Add isPrinting to dependencies

  const handleTabChange = (tab: string, userEmail: string) => {
    if (
      testInfo?.status === 'draft' &&
      tab !== 'test-details' &&
      userEmail !== 'barb@testerson.com'
    )
      return;
    setActiveTab(tab);
    // Find and focus the content
    const element = document.getElementById(`content-${tab}`);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  if (loading || insightLoading) {
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
                  Turning data into insights...
                </p>
              ) : (
                <p className="text-primary-500/50 text-sm font-medium">Loading test data...</p>
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
    <div className="h-[90vh] flex flex-col overflow-hidden">
      <div className="max-w-screen-2xl px-4">
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Insights Summary</h1>
          <ReportPDF
            testDetails={convertTestToTestDetails(testInfo)}
            summaryData={summaryData}
            insights={insight}
            disabled={testInfo?.status !== 'complete'}
            competitiveinsights={competitiveinsights}
            averagesurveys={averagesurveys}
          />
        </div>
        <ReportTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          variantStatus={testInfo?.status}
        />
      </div>
      {isPrinting ? (
        <LoadingSpinner />
      ) : (
        <ReportContent
          insights={insight}
          activeTab={activeTab}
          variant={testInfo}
          summaryData={summaryData}
          averagesurveys={averagesurveys?.summaryData}
          competitiveinsights={competitiveinsights?.summaryData}
        />
      )}
    </div>
  );
};

export default Report;

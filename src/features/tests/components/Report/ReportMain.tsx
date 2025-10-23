import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import ReportContent from './ReportContent';
import ReportPDF from './ReportPDF';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import {
  getSummaryData,
  getAveragesurveys,
  getCompetitiveInsights,
  getAiInsights,
} from './services/dataInsightService';
import { useTestDetail } from '../../hooks/useTestDetail';
import { useInsightStore } from '../../hooks/useIaInsight';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import { supabase } from '../../../../lib/supabase';
import { getDefaultQuestions } from '../TestQuestions/questionConfig';

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

// Función de conversión movida fuera del componente para evitar recreación en cada re-render
const convertTestToTestDetails = (test: any): any => {
  return {
    ...test,
    objective: test.objective || '', // Asegurar que objective no sea undefined
    updatedAt: test.updatedAt || test.createdAt, // Usar createdAt como fallback
  };
};

// Helper function to select competitive insights based on available variants
const getCompetitiveInsightsForAvailableVariants = (insight: any, testInfo: any): string => {
  if (!insight || !testInfo?.variations) {
    return '';
  }

  const availableVariants = [];
  
  // Check which variants are available in the test
  if (testInfo.variations.a) {
    availableVariants.push('a');
  }
  if (testInfo.variations.b) {
    availableVariants.push('b');
  }
  if (testInfo.variations.c) {
    availableVariants.push('c');
  }

  // If no variants are available, return empty string
  if (availableVariants.length === 0) {
    return '';
  }

  // Find the first available variant that has competitive insights
  for (const variant of availableVariants) {
    const insightsKey = `competitive_insights_${variant}` as keyof typeof insight;
    if (insight[insightsKey] && insight[insightsKey].trim() !== '') {
      return insight[insightsKey];
    }
  }

  // If no variant has competitive insights, return empty string
  return '';
};

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
  const {
    insight,
    aiInsights,
    loading: insightLoading,
    setInsight,
    setAiInsights,
    setLoading,
  } = useInsightStore();
  const [activeTab, setActiveTab] = useState('test-details');
  const [isPrinting] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [averagesurveys, setAveragesurveys] = useState<any>(null);
  const [competitiveinsights, setCompetitiveinsights] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const fetchingRef = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummaryData = async () => {
      // Evitar múltiples ejecuciones
      if (!testInfo || fetchingRef.current || dataLoaded) return;

      fetchingRef.current = true;
      const currentTestId = testInfo.id; // Capture test ID to prevent stale data

      try {
        setLoading(true);

        const [data, averagesurveys, competitiveinsights, aiInsightsData] = await Promise.all([
          getSummaryData(id),
          getAveragesurveys(id),
          getCompetitiveInsights(id),
          getAiInsights(id),
        ]);

        // Only update state if test hasn't changed during fetch
        if (testInfo && testInfo.id === currentTestId) {
          setSummaryData(data);
          setAveragesurveys(averagesurveys);
          setCompetitiveinsights(competitiveinsights);

          // Handle the new single object structure
          if (!aiInsightsData.error && aiInsightsData.insights) {
            // Set the single insight object
            setInsight(aiInsightsData.insights);
            // For backward compatibility, also set it as aiInsights array with single item
            setAiInsights([aiInsightsData.insights]);
          } else if (aiInsightsData.error) {
            console.warn('AI insights error:', aiInsightsData.error);
            setInsight(null);
            setAiInsights([]);
          } else {
            setInsight(null);
            setAiInsights([]);
          }

          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchSummaryData();
  }, [testInfo?.id, id, setInsight, setAiInsights, setLoading, dataLoaded]);

  // Limpiar estado cuando cambia el ID del test
  useEffect(() => {
    if (testInfo?.id && testInfo.id !== id) {
      setDataLoaded(false);
      setSummaryData(null);
      setAveragesurveys(null);
      setCompetitiveinsights(null);
      fetchingRef.current = false;
    }
  }, [testInfo?.id, id]);

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

  // Fetch selected questions from database
  useEffect(() => {
    if (testInfo?.id) {
      const fetchSelectedQuestions = async () => {
        try {
          const { data, error } = await supabase
            .from('test_survey_questions')
            .select('selected_questions')
            .eq('test_id', testInfo.id as any)
            .single();
          
          if (error) {
            console.log('Survey questions query error:', error.message, 'Code:', error.code);
            setSelectedQuestions(getDefaultQuestions());
          } else if (data && 'selected_questions' in data) {
            console.log('Successfully loaded survey questions from database');
            setSelectedQuestions((data as any).selected_questions);
          } else {
            console.log('No survey questions data found, using defaults');
            setSelectedQuestions(getDefaultQuestions());
          }
        } catch (error) {
          console.error('Exception fetching survey questions:', error);
          setSelectedQuestions(getDefaultQuestions());
        }
      };

      fetchSelectedQuestions();
    }
  }, [testInfo?.id]);

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
      <div className="min-h-screen bg-[#f9fcfa] flex items-center justify-center">
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
        <div className="min-h-screen bg-[#f9fcfa] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#f9fcfa] flex items-center justify-center">
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
            insights={insight ? {
              purchase_drivers: insight.purchase_drivers,
              recommendations: insight.recommendations,
              competitive_insights: getCompetitiveInsightsForAvailableVariants(insight, testInfo),
              comment_summary: insight.comment_summary,
              shopper_comments: []
            } : {
              purchase_drivers: '',
              recommendations: '',
              competitive_insights: '',
              comment_summary: '',
              shopper_comments: []
            }}
            disabled={testInfo?.status !== 'complete'}
            competitiveinsights={competitiveinsights}
            averagesurveys={averagesurveys}
            aiInsights={aiInsights}
            selectedQuestions={selectedQuestions}
            shopperComments={{
              comparision: {
                a: (testInfo?.responses?.comparisons as any)?.a || [],
                b: (testInfo?.responses?.comparisons as any)?.b || [],
                c: (testInfo?.responses?.comparisons as any)?.c || [],
              },
              surveys: {
                a: (testInfo?.responses?.surveys as any)?.a || [],
                b: (testInfo?.responses?.surveys as any)?.b || [],
                c: (testInfo?.responses?.surveys as any)?.c || [],
              },
            }}
            testData={{
              competitors: testInfo?.competitors?.map(comp => ({
                id: comp.id || '',
                title: comp.title || '',
                image_url: comp.image_url || '',
                price: comp.price || 0,
              })) || [],
              variations: {
                a: testInfo?.variations?.a ? {
                  id: testInfo.variations.a.id || '',
                  title: testInfo.variations.a.title || '',
                  image_url: testInfo.variations.a.image_url || '',
                  price: testInfo.variations.a.price || 0,
                } : null,
                b: testInfo?.variations?.b ? {
                  id: testInfo.variations.b.id || '',
                  title: testInfo.variations.b.title || '',
                  image_url: testInfo.variations.b.image_url || '',
                  price: testInfo.variations.b.price || 0,
                } : null,
                c: testInfo?.variations?.c ? {
                  id: testInfo.variations.c.id || '',
                  title: testInfo.variations.c.title || '',
                  image_url: testInfo.variations.c.image_url || '',
                  price: testInfo.variations.c.price || 0,
                } : null,
              },
            }}
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
          aiInsights={aiInsights}
          testId={id}
        />
      )}
    </div>
  );
};

export default Report;

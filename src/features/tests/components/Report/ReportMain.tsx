import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import ReportContent from './ReportContent';
import ReportPDF from './ReportPDF';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import { getSummaryData, checkIdInIaInsights, processCompetitiveInsightsData, getAveragesurveys, getCompetitiveInsights } from './services/dataInsightService';

interface ReportProps {
  variant: any;
}

interface ReportTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  variantStatus: string;
}

const ReportTabs: React.FC<ReportTabsProps> = ({ activeTab, onTabChange, variantStatus }) => {
  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <nav className="flex gap-1 min-w-max pb-1">
        {['test-details', 'summary', 'purchase-drivers', 'competitive-insights', 'shopper-comments', 'recommendations'].map(tab => {
          const isDisabled = variantStatus === 'draft' && tab !== 'test-details';
          return (
            <button
              className={clsx(
                'py-2 px-2 sm:px-3 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base',
                activeTab === tab
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent hover:border-gray-300',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              key={tab}
              onClick={() => !isDisabled && onTabChange(tab)}
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

const Report: React.FC<ReportProps> = ({ variant: testData }) => {
  const [activeTab, setActiveTab] = useState('test-details');
  const [isPrinting, setIsPrinting] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [averagesurveys, setAveragesurveys] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [competitiveinsights, setCompetitiveinsights] = useState<any>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      // First check if we already have insights for this test
      const existingInsights = await checkIdInIaInsights(testData.id);
      if (existingInsights && typeof existingInsights === 'object' && 'comparison_between_variants' in existingInsights) {
        // If we have insights, add them to the existing summary data
        const data = await getSummaryData(testData);
        const averagesurveys = await getAveragesurveys(testData);
        const competitiveinsights = await getCompetitiveInsights(testData);

        console.log(competitiveinsights);
        setCompetitiveinsights(competitiveinsights);
        setSummaryData({
          ...data,
          insights: {
            comparison_between_variants: existingInsights.comparison_between_variants,
          }
        });
        setAveragesurveys(averagesurveys);
        setInsights(existingInsights);
        return;
      }

      // If no insights exist, fetch new summary data
      const data = await getSummaryData(testData);
      setSummaryData(data);
    };
    fetchSummaryData();
  }, [testData]);

  useEffect(() => {
    const observerOptions = {
      root: document.getElementById('report-content'),
      rootMargin: '0px',
      threshold: 0.5
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

  const handleTabChange = (tab: string) => {
    if (testData.status === 'draft' && tab !== 'test-details') return;
    setActiveTab(tab);
    // Find and focus the content
    const element = document.getElementById(`content-${tab}`);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-[90vh] flex flex-col overflow-hidden">
      <div className="max-w-screen-2xl px-4">
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Insights Summary</h1>
          <ReportPDF
            testDetails={testData}
            summaryData={summaryData}
            insights={insights}
            disabled={testData.status !== 'complete'}
            competitiveinsights={competitiveinsights}
          />
        </div>
        <ReportTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          variantStatus={testData.status}
        />
      </div>
      {isPrinting ? (
        <LoadingSpinner />
      ) : (
        <ReportContent
          activeTab={activeTab}
          variant={testData}
          summaryData={summaryData}
          averagesurveys={averagesurveys?.summaryData}
          competitiveinsights={competitiveinsights?.summaryData}
        />
      )}
    </div>
  );
};

export default Report;


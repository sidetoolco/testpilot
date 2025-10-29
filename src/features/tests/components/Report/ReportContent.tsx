import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import PurchaseDrivers from './sections/PurchaseDrivers';
import CompetitiveInsights from './sections/CompetitiveInsights';
import ShopperComments from './sections/ShopperComments';
import TestSummary from '../TestSummary';
import Summary from './sections/summary';
import Recommendations from './sections/RecommendationsList';

interface ReportContentProps {
  activeTab: string;
  variant: any;
  summaryData: any;
  averagesurveys: any;
  competitiveinsights: any;
  insights: any;
  aiInsights?: any[];
  testId?: string;
  selectedQuestions?: string[];
}

const ReportContent: React.FC<ReportContentProps> = ({
  activeTab,
  variant,
  summaryData,
  averagesurveys,
  competitiveinsights,
  insights,
  aiInsights,
  testId,
  selectedQuestions,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayTab, setDisplayTab] = useState(activeTab);
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setDisplayTab(activeTab);
        setIsTransitioning(false);
      }, 150);

      prevTabRef.current = activeTab;

      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  return (
    <div className="flex-1 overflow-hidden p-4">
      <div
        tabIndex={0}
        className={clsx(
          'h-full overflow-y-auto',
          'focus:outline-none '
        )}
        id="report-content"
      >
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 h-full">
          <div
            key={displayTab}
            className={`transition-opacity duration-150 ease-in-out ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div id="content-summary" className={clsx(displayTab !== 'summary' && 'hidden')}>
              <Summary summaryData={summaryData} insights={insights} />
            </div>
            <div
              id="content-purchase-drivers"
              className={clsx(displayTab !== 'purchase-drivers' && 'hidden')}
            >
              <PurchaseDrivers 
                surveys={averagesurveys} 
                insights={insights} 
                aiInsights={aiInsights} 
                selectedQuestions={selectedQuestions}
              />
            </div>
            <div
              id="content-competitive-insights"
              className={clsx(displayTab !== 'competitive-insights' && 'hidden')}
            >
              <CompetitiveInsights
                competitiveinsights={competitiveinsights}
                variants={averagesurveys}
                sumaryvariations={summaryData?.rows}
                selectedQuestions={selectedQuestions}
              />
            </div>
            <div
              id="content-shopper-comments"
              className={clsx( displayTab !== 'shopper-comments' && 'hidden')}
            >
              <ShopperComments
                comparision={variant.responses.comparisons}
                surveys={variant.responses.surveys}
                testName={variant.name}
                testData={{
                  competitors: variant.competitors || [],
                  variations: variant.variations || { a: null, b: null, c: null },
                }}
              />
            </div>
            <div
              id="content-recommendations"
              className={clsx(displayTab !== 'recommendations' && 'hidden')}
            >
              <Recommendations />
            </div>
            <div id="content-test-details" className={clsx(displayTab !== 'test-details' && 'hidden')}>
              <TestSummary test={variant} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportContent;

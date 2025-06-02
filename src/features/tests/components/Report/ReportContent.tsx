import React from 'react';
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
}

const ReportContent: React.FC<ReportContentProps> = ({
  activeTab,
  variant,
  summaryData,
  averagesurveys,
  competitiveinsights,
  insights,
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      <div
        tabIndex={0}
        className={clsx(
          'h-full overflow-y-auto',
          'focus:outline-none focus:ring-2 focus:ring-green-600'
        )}
        id="report-content"
      >
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 h-full">
          <div id="content-summary" className={clsx(activeTab !== 'summary' && 'hidden')}>
            <Summary summaryData={summaryData} insights={insights} />
          </div>
          <div
            id="content-purchase-drivers"
            className={clsx(activeTab !== 'purchase-drivers' && 'hidden')}
          >
            <PurchaseDrivers surveys={averagesurveys} />
          </div>
          <div
            id="content-competitive-insights"
            className={clsx(activeTab !== 'competitive-insights' && 'hidden')}
          >
            <CompetitiveInsights
              competitiveinsights={competitiveinsights}
              variants={averagesurveys}
              sumaryvariations={summaryData?.rows}
            />
          </div>
          <div
            id="content-shopper-comments"
            className={clsx('p-4', activeTab !== 'shopper-comments' && 'hidden')}
          >
            <ShopperComments
              comparision={variant.responses.comparisons}
              surveys={variant.responses.surveys}
            />
          </div>
          <div
            id="content-recommendations"
            className={clsx(activeTab !== 'recommendations' && 'hidden')}
          >
            <Recommendations />
          </div>
          <div id="content-test-details" className={clsx(activeTab !== 'test-details' && 'hidden')}>
            <TestSummary test={variant} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportContent;

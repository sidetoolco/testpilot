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
  variantsArray: any[];
}

const ReportContent: React.FC<ReportContentProps> = ({ activeTab, variant, variantsArray }) => {
  return (
    <div className="flex-1 overflow-hidden">
      <div
        tabIndex={0}
        className={clsx(
          'h-full overflow-y-auto',
          'focus:outline-none focus:ring-2 focus:ring-green-600',
        )}
        id="report-content"
      >
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 h-full">
          <div
            id="content-summary"
            className={clsx(
              'p-4',
              activeTab !== 'summary' && 'hidden'
            )}
          >
            <Summary variants={variantsArray} surveys={variant.responses.surveys} comparision={variant.responses.comparisons} testerId={variant.id} />
          </div>
          <div
            id="content-purchase-drivers"
            className={clsx(
              'p-4',
              activeTab !== 'purchase-drivers' && 'hidden'
            )}
          >
            <PurchaseDrivers surveys={variant.responses.surveys} />
          </div>
          <div
            id="content-competitive-insights"
            className={clsx(
              'p-4',
              activeTab !== 'competitive-insights' && 'hidden'
            )}
          >
            <CompetitiveInsights comparision={variant.responses.comparisons} competitorProducts={variant.competitors} />
          </div>
          <div
            id="content-shopper-comments"
            className={clsx(
              'p-4',
              activeTab !== 'shopper-comments' && 'hidden'
            )}
          >
            <ShopperComments comparision={variant.responses.comparisons} surveys={variant.responses.surveys} />
          </div>
          <div
            id="content-recommendations"
            className={clsx(
              'p-4',
              activeTab !== 'recommendations' && 'hidden'
            )}
          >
            <Recommendations />
          </div>
          <div
            id="content-test-details"
            className={clsx(
              'p-4',
              activeTab !== 'test-details' && 'hidden'
            )}
          >
            <TestSummary test={variant} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportContent; 
import React, { useState } from 'react';
import Summary from './summary';
import PurchaseDrivers from './purchase-drivers';
import CompetitiveInsights from './competitive-insights';
import ShopperComments from './shopper-comments';
import Recommendations from './recommendations';
import clsx from 'clsx';
import { FileSpreadsheet, File as FilePdf } from 'lucide-react';
import TestSummary from '../TestSummary';

interface ReportProps {
  variant: any;
}

const Report: React.FC<ReportProps> = ({ variant }) => {
  const [activeTab, setActiveTab] = useState('summary');
  console.log(variant);


  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <Summary variant={variant.variations} />;
      case 'purchase-drivers':
        return <PurchaseDrivers />;
      case 'competitive-insights':
        return <CompetitiveInsights />;
      case 'shopper-comments':
        return <ShopperComments />;
      case 'recommendations':
        return <Recommendations />;
      case 'test-details':
        return <TestSummary test={variant} />
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mt-4 flex flex-row justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard Summary</h1>
        {/* Export buttons */}
        <div className="flex gap-4 mb-6">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={20} />
            Export to Excel
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <FilePdf size={20} />
            Export to PDF
          </button>
        </div>
      </div>
      {/* <div>
        {JSON.stringify(variant)}
      </div> */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-4 min-w-max pb-1">
          {['summary', 'purchase-drivers', 'competitive-insights', 'shopper-comments', 'recommendations', 'test-details'].map(tab => (
            <button
              className={clsx(
                'py-2 px-3 sm:px-4 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base',
                activeTab === tab
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent hover:border-gray-300'
              )}
              key={tab}
              onClick={() => handleTabChange(tab)}
            >
              {tab.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase())}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4 min-h-screen">
        {renderTabContent()}
      </div>


    </div>
  );
};

export default Report;

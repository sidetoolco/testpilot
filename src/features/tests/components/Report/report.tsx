import React, { useState } from 'react';
import Summary from './summary';
import PurchaseDrivers from './purchase-drivers';
import CompetitiveInsights from './competitive-insights';
import ShopperComments from './shopper-comments';
import Recommendations from './recommendations';

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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mt-4 flex flex-row justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard Summary</h1>
        <div className="flex flex-row">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Download XLS</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded ml-2">Download PDF</button>
        </div>
      </div>
      {/* <div>
        {JSON.stringify(variant)}
      </div> */}
      <div className="flex space-x-4 mb-4">
        {['summary', 'purchase-drivers', 'competitive-insights', 'shopper-comments', 'recommendations'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-green-500 text-white' : 'bg-white text-green-500'}`}
          >
            {tab.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase())}
          </button>
        ))}
      </div>
      <div className="mt-4 min-h-screen">
        {renderTabContent()}
      </div>


    </div>
  );
};

export default Report;

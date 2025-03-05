import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import ReportContent from './ReportContent';
import ReportPDF from './ReportPDF';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';

interface ReportProps {
  variant: any;
}

interface ReportTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ReportTabs: React.FC<ReportTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <nav className="flex gap-1 min-w-max pb-1">
        {['summary', 'purchase-drivers', 'competitive-insights', 'shopper-comments', 'recommendations', 'test-details'].map(tab => (
          <button
            className={clsx(
              'py-2 px-2 sm:px-3 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base',
              activeTab === tab
                ? 'border-green-600 text-green-600'
                : 'border-transparent hover:border-gray-300'
            )}
            key={tab}
            onClick={() => onTabChange(tab)}
          >
            {tab.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase())}
          </button>
        ))}
      </nav>
    </div>
  );
};

const Report: React.FC<ReportProps> = ({ variant: testData }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isPrinting, setIsPrinting] = useState(false);
  const variantsArray = [testData.variations.a, testData.variations.b, testData.variations.c].filter(v => v);

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
            onPrintStart={() => setIsPrinting(true)}
            onPrintEnd={() => setIsPrinting(false)}
            testDetails={testData}
          />
        </div>
        <ReportTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      {isPrinting ? (
        <LoadingSpinner />
      ) : (
        <ReportContent
          activeTab={activeTab}
          variant={testData}
          variantsArray={variantsArray}
        />
      )}
    </div>
  );
};

export default Report;


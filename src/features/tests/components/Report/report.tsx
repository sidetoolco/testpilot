import React, { useState, useEffect } from 'react';
import Summary from './summary';
import PurchaseDrivers from './purchase-drivers';
import CompetitiveInsights from './competitive-insights';
import ShopperComments from './shopper-comments';
import Recommendations from './recommendations';
import clsx from 'clsx';
import { FileSpreadsheet, File as FilePdf } from 'lucide-react';
import TestSummary from '../TestSummary';
import html2pdf from 'html2pdf.js';

interface ReportProps {
  variant: any;
}

const Report: React.FC<ReportProps> = ({ variant }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isPrinting, setIsPrinting] = useState(false);
  console.log(variant);
  const variantsArray = [variant.a, variant.b, variant.c].filter(v => v);

  useEffect(() => {
    const observerOptions = {
      root: document.getElementById('report-content'),
      rootMargin: '0px',
      threshold: 0.5
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const tabName = sectionId.replace('content-', '');
          setActiveTab(tabName);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Observe all section elements
    const sections = document.querySelectorAll('[id^="content-"]');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Find and focus the content
    const element = document.getElementById(`content-${tab}`);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExportPDF = () => {
    setIsPrinting(true); // Set printing mode before generating PDF
    const element = document.getElementById('report-content');
    const opt = {
      margin: 1,
      filename: 'test-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        windowWidth: 1920,
        windowHeight: 1080,
        letterRendering: true
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'landscape',
        hotfixes: ['px_scaling']
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.pdf-page'
      }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 1, pdf.internal.pageSize.getHeight() - 0.5);
        }
      })
      .save()
      .then(() => {
        setIsPrinting(false); // Reset printing mode after PDF is generated
      });
  };
  console.log(variant);

  return (
    <div className="h-[90vh] flex flex-col overflow-hidden">
      <div className="max-w-screen-2xl px-4">
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Insights Summary</h1>
          {/* Export buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-center">
            <button
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet size={20} />
              Export to Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <FilePdf size={20} />
              Export to PDF
            </button>
          </div>
        </div>
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
                onClick={() => handleTabChange(tab)}
              >
                {tab.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase())}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div
          tabIndex={0}
          className={clsx(
            'h-full overflow-y-auto',
            'focus:outline-none focus:ring-2 focus:ring-green-600',
            isPrinting ? 'overflow-visible' : 'overflow-y-auto'
          )}
          id="report-content"
          style={{
            pageBreakAfter: 'always',
            pageBreakInside: 'avoid',
          }}
        >
          <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 h-full">
            <div
              id="content-summary"
              className={clsx(
                'pdf-page p-4',
                !isPrinting && (activeTab !== 'summary' && 'hidden')
              )}
            >
              <Summary variants={variantsArray} />
            </div>
            <div
              id="content-purchase-drivers"
              className={clsx(
                'pdf-page p-4',
                !isPrinting && (activeTab !== 'purchase-drivers' && 'hidden')
              )}
            >
              <PurchaseDrivers surveys={variant.responses.surveys} />
            </div>
            <div
              id="content-competitive-insights"
              className={clsx(
                'pdf-page p-4',
                !isPrinting && (activeTab !== 'competitive-insights' && 'hidden')
              )}
            >
              <CompetitiveInsights comparision={variant.responses.comparisons} />
            </div>
            <div
              id="content-shopper-comments"
              className={clsx(
                'pdf-page p-4',
                !isPrinting && (activeTab !== 'shopper-comments' && 'hidden')
              )}
            >
              <ShopperComments comparision={variant.responses.comparisons} surveys={variant.responses.surveys} />
            </div>
            <div
              id="content-recommendations"
              className={clsx(
                'pdf-page p-4',
                !isPrinting && (activeTab !== 'recommendations' && 'hidden')
              )}
            >
              <Recommendations />
            </div>
            <div
              id="content-test-details"
              className={clsx(
                'pdf-page p-4 overflow-y-auto',
                !isPrinting && (activeTab !== 'test-details' && 'hidden')
              )}
            >
              <TestSummary test={variant} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;


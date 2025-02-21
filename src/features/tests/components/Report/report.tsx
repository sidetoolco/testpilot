import React, { useState } from 'react';
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
  console.log(variant);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Find and focus the content
    const element = document.getElementById(`content-${tab}`);
    if (element) {
      element.focus();
    }
  };

  const handleExportPDF = () => {
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
      .save();
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
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <FilePdf size={20} />
            Export to PDF
          </button>
        </div>
      </div>
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
      <div
        tabIndex={0}
        className={clsx(
          'p-4 border rounded-lg ',
          'focus:outline-none focus:ring-2 focus:ring-green-600 my-4 flex flex-col'
        )}
        id="report-content"
        style={{
          pageBreakAfter: 'always',
          pageBreakInside: 'avoid',
        }}
      >
        <div className="pdf-page">
          <Summary variant={variant.variations} />
        </div>
        <div className="pdf-page">
          <PurchaseDrivers />
        </div>
        <div className="pdf-page">
          <CompetitiveInsights />
        </div>
        <div className="pdf-page">
          <ShopperComments />
        </div>
        <div className="pdf-page">
          <Recommendations />
        </div>
        <div className="pdf-page">
          <TestSummary test={variant} />
        </div>
      </div>
    </div>
  );
};

export default Report;

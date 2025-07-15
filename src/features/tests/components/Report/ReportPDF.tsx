import React, { useState } from 'react';
import { FileSpreadsheet, File as FilePdf, X, RefreshCcw, ChevronDown } from 'lucide-react';
import { Document, pdf } from '@react-pdf/renderer';
import { Buffer } from 'buffer';
import { TestDetailsPDFSection } from './pdf-sections/TestDetailsPDFSection';
import { SummaryPDFSection } from './pdf-sections/SummaryPDFSection';
import { PurchaseDriversPDFSection } from './pdf-sections/PurchaseDriversPDFSection';
import { CompetitiveInsightsPDFSection } from './pdf-sections/CompetitiveInsightsPDFSection';
import { RecommendationsPDFSection } from './pdf-sections/RecommendationsPDFSection';
import { CoverPageSection } from './pdf-sections/CoverPageSection';
import { TestDetails } from './utils/types';
import { VariantCover } from './sections/VariantCover';
import apiClient from '../../../../lib/api';
import { toast } from 'sonner';
import { PurchaseDriversTextSection } from './pdf-sections/PurchaseDriversTextSection';
import { PurchaseDriversChartSection } from './pdf-sections/PurchaseDriversChartSection';
import { CompetitiveInsightsTextSection } from './pdf-sections/CompetitiveInsightsTextSection';
import { CompetitiveInsightsTableSection } from './pdf-sections/CompetitiveInsightsTableSection';
import { ShopperCommentsPDFSection } from './pdf-sections/ShopperCommentsPDFSection';
import { PDFOrientation } from './types';
import { supabase } from '../../../../lib/supabase';
import * as XLSX from 'xlsx';

// Configure Buffer for browser
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

interface TestExportData {
  summary_results: any[];
  purchase_drivers: any[];
  competitive_ratings: any[];
  shopper_comments: any[];
}

interface PDFDocumentProps {
  testDetails: TestDetails;
  summaryData: any;
  onPrintStart?: () => void;
  onPrintEnd?: () => void;
  insights: {
    purchase_drivers?: string;
    recommendations?: string;
    competitive_insights?: string;
    shopper_comments?: any[];
    comment_summary?: string;
  };
  competitiveinsights: any;
  averagesurveys: any;
  disabled?: boolean;
}

const generateExcelFile = (exportData: TestExportData, testName: string) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // 1. Summary Results
  if (exportData.summary_results && exportData.summary_results.length > 0) {
    const summarySheet = XLSX.utils.json_to_sheet(exportData.summary_results);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary Results');
  }

  // 2. Purchase Drivers
  if (exportData.purchase_drivers && exportData.purchase_drivers.length > 0) {
    const purchaseSheet = XLSX.utils.json_to_sheet(exportData.purchase_drivers);
    XLSX.utils.book_append_sheet(workbook, purchaseSheet, 'Purchase Drivers');
  }

  // 3. Competitive Ratings
  if (exportData.competitive_ratings && exportData.competitive_ratings.length > 0) {
    const competitiveSheet = XLSX.utils.json_to_sheet(exportData.competitive_ratings);
    XLSX.utils.book_append_sheet(workbook, competitiveSheet, 'Competitive Ratings');
  }

  // 4. Shopper Comments
  if (exportData.shopper_comments && exportData.shopper_comments.length > 0) {
    const commentsSheet = XLSX.utils.json_to_sheet(exportData.shopper_comments);
    XLSX.utils.book_append_sheet(workbook, commentsSheet, 'Shopper Comments');
  }

  // Generate file and download it
  const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_export.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

const getTestExportData = async (testId: string): Promise<TestExportData | null> => {
  try {
    const { data, error } = await supabase.rpc('get_test_export_data', {
      input_test_id: testId,
    });

    if (error) {
      console.error('Error calling get_test_export_data RPC:', error);
      throw error;
    }

    if (!data) {
      console.warn('No data returned from get_test_export_data RPC');
      return null;
    }

    // Verify that the response has the expected structure
    const exportData = data as TestExportData;
    return exportData;
  } catch (error) {
    console.error('Failed to get test export data:', error);
    throw error;
  }
};

const PDFDocument = ({
  testDetails,
  summaryData,
  insights,
  competitiveinsights,
  averagesurveys,
  orientation = 'portrait',
}: {
  testDetails: PDFDocumentProps['testDetails'];
  summaryData: PDFDocumentProps['summaryData'];
  insights: PDFDocumentProps['insights'];
  competitiveinsights: PDFDocumentProps['competitiveinsights'];
  averagesurveys: PDFDocumentProps['averagesurveys'];
  orientation?: PDFOrientation;
}) => {
  if (!testDetails || !summaryData) {
    return null;
  }

  const variantsArray = [
    testDetails.variations?.a,
    testDetails.variations?.b,
    testDetails.variations?.c,
  ].filter(v => v);

  // Ensure optional data has valid structure
  const safeInsights = insights || {
    purchase_drivers: '',
    recommendations: '',
    competitive_insights: '',
  };

  const safeCompetitiveInsights = competitiveinsights || { summaryData: [] };
  const safeAveragesurveys = averagesurveys || { summaryData: [] };

  return (
    <Document>
      <CoverPageSection
        testDetails={testDetails}
        variantsArray={variantsArray}
        orientation={orientation}
      />
      <TestDetailsPDFSection testDetails={testDetails} orientation={orientation} />
      <SummaryPDFSection
        summaryData={summaryData}
        insights={safeInsights}
        orientation={orientation}
      />

      {/* New structure: Purchase Drivers with general text first */}
      {safeInsights?.purchase_drivers && (
        <PurchaseDriversTextSection
          insights={safeInsights.purchase_drivers}
          orientation={orientation}
        />
      )}

      {/* Then charts for each variant */}
      {Object.entries(testDetails.variations || {}).map(
        ([key, variation]) =>
          variation &&
          safeAveragesurveys.summaryData?.find((item: any) => item.variant_type === key) && (
            <PurchaseDriversChartSection
              key={key}
              variantKey={key}
              variantTitle={variation.title}
              averagesurveys={safeAveragesurveys.summaryData.find(
                (item: any) => item.variant_type === key
              )}
              orientation={orientation}
            />
          )
      )}

      {/* New structure: Competitive Insights with general text first */}
      {safeInsights?.competitive_insights && (
        <CompetitiveInsightsTextSection
          insights={safeInsights.competitive_insights}
          orientation={orientation}
        />
      )}

      {/* Then tables for each variant */}
      {Object.entries(testDetails.variations || {}).map(
        ([key, variation]) =>
          variation && (
            <CompetitiveInsightsTableSection
              key={`competitive-table-${key}`}
              variantKey={key}
              variantTitle={variation.title}
              competitiveinsights={
                safeCompetitiveInsights.summaryData?.filter(
                  (item: any) => item.variant_type === key
                ) || []
              }
              orientation={orientation}
            />
          )
      )}

      {/* Shopper Comments Analysis */}
      {(() => {
        const shouldShowComments =
          safeInsights?.comment_summary ||
          (safeInsights?.shopper_comments && safeInsights.shopper_comments.length > 0) ||
          testDetails.responses?.comparisons ||
          testDetails.responses?.surveys;

        return shouldShowComments;
      })() && (
        <ShopperCommentsPDFSection
          comments={safeInsights?.shopper_comments || []}
          comparision={testDetails.responses?.comparisons}
          surveys={testDetails.responses?.surveys}
          shopperCommentsSummary={safeInsights?.comment_summary || ''}
          orientation={orientation}
        />
      )}

      {safeInsights?.recommendations && (
        <RecommendationsPDFSection
          insights={safeInsights.recommendations}
          orientation={orientation}
        />
      )}
    </Document>
  );
};

const PDFPreviewModal = ({
  isOpen,
  onClose,
  pdfUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">PDF Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
        </div>
      </div>
    </div>
  );
};

export const ReportPDF: React.FC<PDFDocumentProps> = ({
  averagesurveys,
  testDetails,
  summaryData,
  insights,
  competitiveinsights,
  disabled,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [orientation, setOrientation] = useState<PDFOrientation>('portrait');
  const [showOrientationMenu, setShowOrientationMenu] = useState(false);

  const isTestActiveOrComplete =
    testDetails?.status === 'active' || testDetails?.status === 'complete';

  const handleExportToExcel = async () => {
    if (!testDetails?.id) {
      toast.error('No test ID available');
      return;
    }

    setIsExportingExcel(true);

    try {
      const exportData = await getTestExportData(testDetails.id);

      if (exportData) {
        toast.success('Export data retrieved successfully');
        generateExcelFile(exportData, testDetails.name);
      } else {
        toast.error('No data available for export');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export test data');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async (selectedOrientation: PDFOrientation = orientation) => {
    if (isGenerating) return; // Prevent multiple simultaneous generations

    try {
      setIsGenerating(true);

      // Clear previous URL if it exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }

      // Improved data validation
      if (!testDetails) {
        console.error('Missing testDetails');
        toast.error('Missing test details');
        return;
      }

      if (!summaryData) {
        console.error('Missing summaryData');
        toast.error('Missing summary data');
        return;
      }

      // Create data with default values for optional fields
      const pdfData = {
        testDetails: JSON.parse(JSON.stringify(testDetails)),
        summaryData: JSON.parse(JSON.stringify(summaryData)),
        insights: insights
          ? JSON.parse(JSON.stringify(insights))
          : {
              purchase_drivers: '',
              recommendations: '',
              competitive_insights: '',
              shopper_comments: [],
              comment_summary: '',
            },
        competitiveinsights: competitiveinsights
          ? JSON.parse(JSON.stringify(competitiveinsights))
          : {
              summaryData: [],
            },
        averagesurveys: averagesurveys
          ? JSON.parse(JSON.stringify(averagesurveys))
          : {
              summaryData: [],
            },
      };

      const blob = await pdf(
        <PDFDocument
          testDetails={pdfData.testDetails}
          summaryData={pdfData.summaryData}
          insights={pdfData.insights}
          competitiveinsights={pdfData.competitiveinsights}
          averagesurveys={pdfData.averagesurveys}
          orientation={selectedOrientation}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(
        'Error generating PDF: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    // Don't clear URL immediately to allow reopening
  };

  const handleRegenerateInsights = () => {
    setLoadingInsights(true);

    apiClient
      .post(`/insights/${testDetails.id}`)
      .then(() => {
        toast.success('Insights regenerated successfully');
        window.location.reload();
      })
      .catch((error) => {
        console.error('Failed to regenerate insights:', error);
        toast.error('Failed to regenerate insights');
        setLoadingInsights(false);
      });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-center">
        <button
          onClick={handleExportToExcel}
          disabled={isExportingExcel}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet size={20} />
          {isExportingExcel ? 'Exporting...' : 'Export to Excel'}
        </button>
        <button
          disabled={loadingInsights}
          onClick={handleRegenerateInsights}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <RefreshCcw size={20} />
          {loadingInsights ? 'Regenerating Insights...' : 'Regenerate Insights'}
        </button>

        {/* Dropdown for Export to PDF */}
        <div className="relative">
          <button
            onClick={() => setShowOrientationMenu(!showOrientationMenu)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!isTestActiveOrComplete || isGenerating}
          >
            <FilePdf size={20} />
            {isGenerating ? 'Generating PDF...' : 'Export to PDF'}
            <ChevronDown size={16} />
          </button>

          {showOrientationMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-full">
              <button
                onClick={() => {
                  setOrientation('portrait' as PDFOrientation);
                  setShowOrientationMenu(false);
                  handleExportPDF('portrait' as PDFOrientation);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between first:rounded-t-md last:rounded-b-md"
              >
                <span>Portrait</span>
                {orientation === 'portrait' && <span className="text-green-600 font-bold">✓</span>}
              </button>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={() => {
                  setOrientation('landscape' as PDFOrientation);
                  setShowOrientationMenu(false);
                  handleExportPDF('landscape' as PDFOrientation);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between first:rounded-t-md last:rounded-b-md"
              >
                <span>Landscape</span>
                {orientation === 'landscape' && <span className="text-green-600 font-bold">✓</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {showOrientationMenu && (
        <div className="fixed inset-0 z-5" onClick={() => setShowOrientationMenu(false)} />
      )}

      {isPreviewOpen && pdfUrl && (
        <PDFPreviewModal isOpen={isPreviewOpen} onClose={handleClosePreview} pdfUrl={pdfUrl} />
      )}
    </>
  );
};

export default ReportPDF;

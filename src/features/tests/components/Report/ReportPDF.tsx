import React, { useState } from 'react';
import { FileSpreadsheet, File as FilePdf, X, RefreshCcw } from 'lucide-react';
import { Document, pdf, Page, View, Text } from '@react-pdf/renderer';
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
import { VariantAIInsightsSection } from './pdf-sections/VariantAIInsightsSection';
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
  aiInsights?: any[];
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
  aiInsights,
  orientation = 'landscape',
}: {
  testDetails: PDFDocumentProps['testDetails'];
  summaryData: PDFDocumentProps['summaryData'];
  insights: PDFDocumentProps['insights'];
  competitiveinsights: PDFDocumentProps['competitiveinsights'];
  averagesurveys: PDFDocumentProps['averagesurveys'];
  aiInsights?: PDFDocumentProps['aiInsights'];
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
  const safeAiInsights = aiInsights || [];

  // Get all available variant keys that have data
  const availableVariants = Object.entries(testDetails.variations || {})
    .filter(([key, variation]) => {
      if (!variation) return false;
      
      // Check if this variant has any data
      const hasPurchaseData = safeAveragesurveys.summaryData?.find((item: any) => item.variant_type === key);
      const hasCompetitiveData = safeCompetitiveInsights.summaryData?.filter((item: any) => item.variant_type === key)?.length > 0;
      const hasAIInsights = safeAiInsights.find((insight: any) => insight.variant_type === key);
      
      return hasPurchaseData || hasCompetitiveData || hasAIInsights;
    })
    .map(([key, variation]) => ({ key, variation }))
    .filter(({ variation }) => variation !== null); // Additional filter to ensure variation is not null

  try {
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

        {/* Purchase Drivers Charts - only for variants with data */}
        {availableVariants.map(({ key, variation }) => {
          const hasPurchaseData = safeAveragesurveys.summaryData?.find((item: any) => item.variant_type === key);
          
          if (!hasPurchaseData || !variation) return null;
          
          return (
            <PurchaseDriversChartSection
              key={`purchase-${key}`}
              variantKey={key}
              variantTitle={variation.title}
              averagesurveys={hasPurchaseData}
              orientation={orientation}
            />
          );
        })}

        {/* New structure: Competitive Insights with general text first */}
        {safeInsights?.competitive_insights && (
          <CompetitiveInsightsTextSection
            insights={safeInsights.competitive_insights}
            orientation={orientation}
          />
        )}

        {/* Competitive Insights Tables - only for variants with data */}
        {availableVariants.map(({ key, variation }) => {
          const hasCompetitiveData = safeCompetitiveInsights.summaryData?.filter((item: any) => item.variant_type === key)?.length > 0;
          
          if (!hasCompetitiveData || !variation) return null;
          
          return (
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
          );
        })}

        {/* Variant-specific AI Insights - only for variants with data */}
        {safeAiInsights && safeAiInsights.length > 0 && availableVariants.map(({ key, variation }) => {
          const variantInsight = safeAiInsights.find((insight: any) => insight.variant_type === key);
          
          if (!variantInsight || !variation) return null;
          
          return (
            <VariantAIInsightsSection
              key={`ai-insights-${key}`}
              variantKey={key}
              variantTitle={variation.title}
              insights={{
                purchase_drivers: variantInsight?.purchase_drivers || '',
                competitive_insights: variantInsight?.competitive_insights || '',
              }}
              orientation={orientation}
            />
          );
        })}

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
  } catch (error) {
    console.error('PDFDocument render error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return (
      <Document>
        <Page size="A4" orientation={orientation} style={{ padding: 40, fontFamily: 'Helvetica' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'red', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
              Error rendering PDF: {error instanceof Error ? error.message : 'Unknown error'}
            </Text>
            <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>
              Please check that all required data is available and try again.
            </Text>
          </View>
        </Page>
      </Document>
    );
  }
};

const PDFPreviewModal = ({
  isOpen,
  onClose,
  pdfUrl,
  testName,
}: {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  testName?: string;
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      const filename = testName 
        ? `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf`
        : 'test_report.pdf';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewWindow = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">PDF Preview</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenInNewWindow}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FilePdf size={16} />
              Open in New Window
            </button>
            <button 
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FilePdf size={16} />
              Download PDF
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-100 p-4">
          {/* Warning message about iframe restrictions */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-xs font-bold">!</span>
              </div>
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  PDF Preview may be blocked by browser security
                </p>
                <p className="text-xs text-yellow-700">
                  If the preview appears blank, use "Open in New Window" to view the PDF
                </p>
              </div>
            </div>
          </div>
          
          {/* Try object tag first (better PDF support) */}
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            style={{ 
              border: '2px solid #ccc',
              backgroundColor: '#ffffff',
              minHeight: '400px'
            }}
          >
            {/* Fallback content if object doesn't work */}
            <div className="w-full h-full flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg">
              <FilePdf size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">
                PDF preview is not available in this browser
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={handleOpenInNewWindow}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Open in New Window
                </button>
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </object>
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
  aiInsights,
  disabled,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

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

  const handleExportPDF = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      // Clear previous URL if it exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }

      // Data validation
      if (!testDetails) {
        toast.error('Missing test details');
        return;
      }

      if (!summaryData) {
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
        aiInsights: aiInsights ? JSON.parse(JSON.stringify(aiInsights)) : [],
      };

      const blob = await pdf(
        <PDFDocument
          testDetails={pdfData.testDetails}
          summaryData={pdfData.summaryData}
          insights={pdfData.insights}
          competitiveinsights={pdfData.competitiveinsights}
          averagesurveys={pdfData.averagesurveys}
          aiInsights={pdfData.aiInsights}
          orientation={'landscape' as PDFOrientation}
        />
      ).toBlob();

      if (blob.size === 0) {
        toast.error('Generated PDF is empty');
        return;
      }

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
  };

  const handleRegenerateInsights = () => {
    setLoadingInsights(true);

    apiClient
      .post(`/insights/${testDetails.id}`)
      .then(() => window.location.reload())
      .catch(() => {
        toast.error('Failed to regenerate insights');
        setLoadingInsights(false);
      });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-center">
        <button
          onClick={handleExportToExcel}
          disabled={!isTestActiveOrComplete || isExportingExcel}
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

        {/* Export to PDF button */}
        <div className="relative">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!isTestActiveOrComplete || isGenerating}
          >
            <FilePdf size={20} />
            {isGenerating ? 'Generating PDF...' : 'Export to PDF'}
          </button>

          {/* Removed orientation menu */}
        </div>
      </div>

      {/* Removed orientation menu */}

      {isPreviewOpen && pdfUrl && (
        <PDFPreviewModal 
          isOpen={isPreviewOpen} 
          onClose={handleClosePreview} 
          pdfUrl={pdfUrl} 
          testName={testDetails?.name}
        />
      )}
    </>
  );
};

export default ReportPDF;

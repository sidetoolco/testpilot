import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, File as FilePdf, X, RefreshCcw, Edit } from 'lucide-react';
import { Document, pdf, Page, View, Text } from '@react-pdf/renderer';
import { Buffer } from 'buffer';
import { TestDetailsPDFSection } from './pdf-sections/TestDetailsPDFSection';
import { SummaryPDFSection } from './pdf-sections/SummaryPDFSection';
import { PurchaseDriversPDFSection } from './pdf-sections/PurchaseDriversPDFSection';
import { RecommendationsPDFSection } from './pdf-sections/RecommendationsPDFSection';
import { CoverPageSection } from './pdf-sections/CoverPageSection';
import { TestDetails } from './utils/types';
import { VariantCover } from './sections/VariantCover';
import apiClient from '../../../../lib/api';
import { toast } from 'sonner';
import { PurchaseDriversTextSection } from './pdf-sections/PurchaseDriversTextSection';
import { PurchaseDriversCombinedChartSection } from './pdf-sections/PurchaseDriversCombinedChartSection';
import { CompetitiveInsightsTextSection } from './pdf-sections/CompetitiveInsightsTextSection';
import { CompetitiveInsightsTableSection } from './pdf-sections/CompetitiveInsightsTableSection';
import { PDFOrientation } from './types';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../auth/hooks/useAuth';
import * as XLSX from 'xlsx';
import { EditDataModal } from './EditDataModal';
import { useAdmin } from '../../../../hooks/useAdmin';
import { getCompetitiveInsights } from './services/dataInsightService';

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
  shopperComments?: {
    comparision: {
      a: any[];
      b: any[];
      c: any[];
    };
    surveys: {
      a: any[];
      b: any[];
      c: any[];
    };
  };
  testData?: {
    competitors: Array<{ id: string; title: string; image_url: string; price: number }>;
    variations: {
      a: { id: string; title: string; image_url: string; price: number } | null;
      b: { id: string; title: string; image_url: string; price: number } | null;
      c: { id: string; title: string; image_url: string; price: number } | null;
    };
  };
}

const getChosenProduct = (
  comment: any,
  testData?: PDFDocumentProps['testData']
): any => {
  if (comment.competitor_id) {
    return testData?.competitors.find(comp => comp.id === comment.competitor_id) || null;
  } else {
    return comment.products || null;
  }
};

const generateExcelFile = (exportData: TestExportData, testName: string, shopperComments?: PDFDocumentProps['shopperComments'], testData?: PDFDocumentProps['testData'], isWalmartTest?: boolean) => {
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

  // 4. Shopper Comments - Separate tabs for each variant
  if (shopperComments) {
    ['a', 'b', 'c'].forEach(variantKey => {
      const variantComparision = shopperComments.comparision[variantKey as keyof typeof shopperComments.comparision] || [];
      const variantSurveys = shopperComments.surveys[variantKey as keyof typeof shopperComments.surveys] || [];

      const allComments: any[] = [];

      // Add survey comments
      variantSurveys.forEach((comment, index) => {
        const chosenProduct = getChosenProduct(comment, testData);
        allComments.push({
          'Comment Type': 'Survey - Improvement Suggestion',
          Comment: comment.improve_suggestions || '',
          'Chosen Product': chosenProduct?.title || 'N/A',
          'Product Price': chosenProduct?.price ? `$${chosenProduct.price.toFixed(2)}` : 'N/A',
          Age: comment.tester_id?.shopper_demographic?.age || '',
          Sex: comment.tester_id?.shopper_demographic?.sex || '',
          Country: comment.tester_id?.shopper_demographic?.country_residence || '',
          Index: index + 1,
        });
      });

      // Add comparison comments
      variantComparision.forEach((comment, index) => {
        const chosenProduct = getChosenProduct(comment, testData);
        allComments.push({
          'Comment Type': 'Comparison - Choose Reason',
          Comment: comment.choose_reason || '',
          'Chosen Product': chosenProduct?.title || 'N/A',
          'Product Price': chosenProduct?.price ? `$${chosenProduct.price.toFixed(2)}` : 'N/A',
          Age: comment.tester_id?.shopper_demographic?.age || '',
          Sex: comment.tester_id?.shopper_demographic?.sex || '',
          Country: comment.tester_id?.shopper_demographic?.country_residence || '',
          Index: index + 1,
        });
      });

      if (allComments.length > 0) {
        const sheet = XLSX.utils.json_to_sheet(allComments);
        XLSX.utils.book_append_sheet(workbook, sheet, `Comments Variant ${variantKey.toUpperCase()}`);
      }
    });
  }

  // Generate file and download it with proper naming
  const storePrefix = isWalmartTest ? 'Walmart' : 'Amazon';
  const cleanTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${storePrefix}_${cleanTestName}_export.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

const getTestExportData = async (testId: string): Promise<TestExportData | null> => {
  try {
    // First, determine if this is a Walmart test
    const { data: competitors } = await supabase
      .from('test_competitors')
      .select('product_type')
      .eq('test_id', testId as any);

    const isWalmartTest = competitors?.some((c: any) => c.product_type === 'walmart_product');

    // Get competitive insights data using the same logic as the PDF
    const competitiveInsights = await getCompetitiveInsights(testId);
    
    // Get summary data
    const { data: summaryData } = await supabase
      .from('summary')
      .select('*')
      .eq('test_id', testId as any);

    // Get purchase drivers data
    const { data: purchaseDriversData } = await supabase
      .from('purchase_drivers')
      .select('*')
      .eq('test_id', testId as any);

    // Get shopper comments data
    const commentsTable = isWalmartTest ? 'shopper_comments_walmart' : 'shopper_comments';
    const { data: shopperCommentsData } = await supabase
      .from(commentsTable)
      .select('*')
      .eq('test_id', testId as any);

    // Transform competitive insights data for Excel export
    const competitiveRatings = competitiveInsights.summaryData?.map((item: any) => {
      // For test products, get title from product.title
      // For competitor products, get title from competitor_product_id.title
      let productTitle = 'Unknown Product';
      
      if (item.isTestProduct && item.product?.title) {
        productTitle = item.product.title;
      } else if (item.competitor_product_id?.title) {
        productTitle = item.competitor_product_id.title;
      } else if (item.title) {
        productTitle = item.title;
      }

      return {
        variant_type: item.variant_type,
        product_title: productTitle,
        share_of_buy: item.share_of_buy,
        value: item.value || 0,
        aesthetics: item.aesthetics || 0,
        convenience: item.convenience || 0,
        trust: item.trust || 0,
        utility: item.utility || 0,
        count: item.count || 0
      };
    }) || [];

    // Filter out unwanted fields from summary results
    const filteredSummaryData = summaryData?.map((item: any) => {
      const { created_at, test_id, win, product_id, ...filteredItem } = item;
      return filteredItem;
    }) || [];

    const exportData: TestExportData = {
      summary_results: filteredSummaryData,
      purchase_drivers: purchaseDriversData || [],
      competitive_ratings: competitiveRatings,
      shopper_comments: shopperCommentsData || []
    };

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
      // Only include variants that actually exist and have meaningful data
      if (!variation || !variation.title || !variation.price) return false;
      
      // Check if this variant has any data
      const hasPurchaseData = safeAveragesurveys.summaryData?.find((item: any) => item.variant_type === key);
      const hasCompetitiveData = safeCompetitiveInsights.summaryData?.filter((item: any) => item.variant_type === key)?.length > 0;
      
      // Check for AI insights in the new single object structure
      const aiInsightValue = key === 'a' ? safeAiInsights[0]?.competitive_insights_a :
                            key === 'b' ? safeAiInsights[0]?.competitive_insights_b :
                            key === 'c' ? safeAiInsights[0]?.competitive_insights_c :
                            null;
      
      const hasAIInsights = safeAiInsights && safeAiInsights.length > 0 && 
        aiInsightValue && 
        aiInsightValue !== null && 
        aiInsightValue !== 'null' && 
        aiInsightValue.trim() !== '';

      // Include variant ONLY if it has meaningful data AND has any type of insights
      const hasAnyData = hasPurchaseData || hasCompetitiveData || hasAIInsights;
      
      // Additional check: if AI insights are null, don't include the variant
      const shouldExcludeDueToNullAI = !hasPurchaseData && !hasCompetitiveData && (aiInsightValue === null || aiInsightValue === 'null');
      
      const willInclude = variation && variation.title && variation.price && hasAnyData && !shouldExcludeDueToNullAI;
      return willInclude;
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

        {/* Purchase Drivers Combined Chart - all variants in one chart */}
        {(() => {
          const purchaseDataVariants = availableVariants
            .map(({ key, variation }) => {
              const hasPurchaseData = safeAveragesurveys.summaryData?.find((item: any) => item.variant_type === key);
              return hasPurchaseData ? hasPurchaseData : null;
            })
            .filter(Boolean);

          if (purchaseDataVariants.length > 0) {
            return (
              <PurchaseDriversCombinedChartSection
                key="purchase-drivers-combined"
                averagesurveys={purchaseDataVariants}
                orientation={orientation}
              />
            );
          }
          return null;
        })()}

        {/* New structure: Competitive Insights with general text first */}
        {(() => {

          // Collect all competitive insights from AI insights
          const allVariantInsights: { [key: string]: string } = {};
          
          if (safeAiInsights && safeAiInsights.length > 0) {
            const mainInsight = safeAiInsights[0];
            // Add competitive insights for each available variant (only those that exist in the test)
            availableVariants.forEach(({ key }) => {
              const variantInsight = 
                key === 'a' ? mainInsight.competitive_insights_a :
                key === 'b' ? mainInsight.competitive_insights_b :
                key === 'c' ? mainInsight.competitive_insights_c :
                null;
              
              
              if (variantInsight && variantInsight.trim()) {
                allVariantInsights[key] = variantInsight;
              }
            });
          }

          
          // Show the section only if there are variant-specific insights (removed general insights)
          const hasVariantInsights = Object.keys(allVariantInsights).length > 0;
          
          if (hasVariantInsights) {
            return (
              <CompetitiveInsightsTextSection
                insights={''} // Empty string for general insights
                allVariantInsights={allVariantInsights}
                orientation={orientation}
              />
            );
          }
          return null;
        })()}

        {/* Competitive Insights Tables - only for variants with data */}
        {availableVariants.map(({ key, variation }) => {
          const hasCompetitiveData = safeCompetitiveInsights.summaryData?.filter((item: any) => item.variant_type === key)?.length > 0;
          const hasAIInsights = safeAiInsights && safeAiInsights.length > 0 && 
            (key === 'a' ? safeAiInsights[0].competitive_insights_a :
             key === 'b' ? safeAiInsights[0].competitive_insights_b :
             key === 'c' ? safeAiInsights[0].competitive_insights_c :
             null);
          
          // Show competitive insights table if there's database competitive data (not AI insights)
          // AI insights are shown in the text section above
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
  shopperComments,
  testData,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { isAdmin } = useAdmin();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isTestActiveOrComplete =
    testDetails?.status === 'active' || testDetails?.status === 'complete';

  const handleExportToExcel = async () => {
    if (!testDetails?.id) {
      toast.error('No test ID available');
      return;
    }

    setIsExportingExcel(true);

    try {
      // Determine if this is a Walmart test
      const { data: competitors } = await supabase
        .from('test_competitors')
        .select('product_type')
        .eq('test_id', testDetails.id as any);

      const isWalmartTest = competitors?.some((c: any) => c.product_type === 'walmart_product');

      const exportData = await getTestExportData(testDetails.id);

      if (exportData) {
        toast.success('Export data retrieved successfully');
        generateExcelFile(exportData, testDetails.name, shopperComments, testData, isWalmartTest);
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

      // Create data with default values for optional fields - no deep cloning needed
      const pdfData = {
        testDetails,
        summaryData,
        insights: insights || {
          purchase_drivers: '',
          recommendations: '',
          competitive_insights: '',
          shopper_comments: [],
          comment_summary: '',
        },
        competitiveinsights: competitiveinsights || {
          summaryData: [],
        },
        averagesurveys: averagesurveys || {
          summaryData: [],
        },
        aiInsights: aiInsights || [],
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

  const handleGenerateSummary = async () => {
    if (!testDetails?.id) {
      toast.error('No test ID available');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const response = await apiClient.post(`/insights/${testDetails.id}/generate-summary`);

      const result = response.data;
      
      toast.success(`Successfully generated summary data for ${result.results.length} variants`);
      window.location.reload();
      
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Error generating summary data. Check console for details.');
    } finally {
      setIsGeneratingSummary(false);
    }
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
        {isAdmin && (
                  <button
          onClick={() => setIsEditModalOpen(true)}
          disabled={!isTestActiveOrComplete}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Edit size={20} />
          Edit Insights
        </button>
        )}
        {isAdmin && (
          <button
            disabled={loadingInsights}
            onClick={handleRegenerateInsights}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCcw size={20} />
            {loadingInsights ? 'Regenerating Insights...' : 'Regenerate Insights'}
          </button>
        )}
        {isAdmin && (
          <button
            disabled={isGeneratingSummary}
            onClick={handleGenerateSummary}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCcw size={20} />
            {isGeneratingSummary ? 'Fetching Test Data...' : 'Fetch Test Data'}
          </button>
        )}

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
        </div>
      </div>

      {isPreviewOpen && pdfUrl && (
        <PDFPreviewModal 
          isOpen={isPreviewOpen} 
          onClose={handleClosePreview} 
          pdfUrl={pdfUrl} 
          testName={testDetails?.name}
        />
      )}
      
      <EditDataModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        testId={testDetails?.id || ''}
        testName={testDetails?.name || ''}
      />
    </>
  );
};

export default ReportPDF;

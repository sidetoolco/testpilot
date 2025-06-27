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

// Configurar Buffer para el navegador
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
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
    shopper_comments_summary?: string;
  };
  competitiveinsights: any;
  averagesurveys: any;
  disabled?: boolean;
}

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

  // Asegurar que los datos opcionales tengan estructura válida
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

      {/* Nueva estructura: Purchase Drivers con texto general primero */}
      {safeInsights?.purchase_drivers && (
        <PurchaseDriversTextSection
          insights={safeInsights.purchase_drivers}
          orientation={orientation}
        />
      )}

      {/* Luego las gráficas de cada variante */}
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

      {/* Nueva estructura: Competitive Insights con texto general primero */}
      {safeInsights?.competitive_insights && (
        <CompetitiveInsightsTextSection
          insights={safeInsights.competitive_insights}
          orientation={orientation}
        />
      )}

      {/* Luego las tablas de cada variante */}
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
          safeInsights?.shopper_comments_summary ||
          (safeInsights?.shopper_comments && safeInsights.shopper_comments.length > 0) ||
          testDetails.responses?.comparisons ||
          testDetails.responses?.surveys;

        console.log('ShopperCommentsPDFSection condition check:', {
          hasSummary: !!safeInsights?.shopper_comments_summary,
          hasComments: !!(
            safeInsights?.shopper_comments && safeInsights.shopper_comments.length > 0
          ),
          hasComparisons: !!testDetails.responses?.comparisons,
          hasSurveys: !!testDetails.responses?.surveys,
          shouldShow: shouldShowComments,
        });

        return shouldShowComments;
      })() && (
        <ShopperCommentsPDFSection
          comments={safeInsights?.shopper_comments || []}
          comparision={testDetails.responses?.comparisons}
          surveys={testDetails.responses?.surveys}
          shopperCommentsSummary={safeInsights?.shopper_comments_summary || ''}
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
  const [orientation, setOrientation] = useState<PDFOrientation>('portrait');
  const [showOrientationMenu, setShowOrientationMenu] = useState(false);

  const isTestActiveOrComplete =
    testDetails?.status === 'active' || testDetails?.status === 'complete';

  const handleExportPDF = async (selectedOrientation: PDFOrientation = orientation) => {
    if (isGenerating) return; // Prevenir múltiples generaciones simultáneas

    try {
      setIsGenerating(true);

      // Limpiar URL anterior si existe
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }

      // Validación mejorada de datos
      console.log('Validating data for PDF generation:', {
        testDetails: !!testDetails,
        summaryData: !!summaryData,
        insights: !!insights,
        competitiveinsights: !!competitiveinsights,
        averagesurveys: !!averagesurveys,
        orientation: selectedOrientation,
      });

      if (!testDetails) {
        console.error('Missing testDetails');
        toast.error('Faltan detalles del test');
        return;
      }

      if (!summaryData) {
        console.error('Missing summaryData');
        toast.error('Faltan datos de resumen');
        return;
      }

      // Crear datos con valores por defecto para campos opcionales
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
              shopper_comments_summary: '',
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

      console.log('Generating PDF with data:', {
        testDetailsName: pdfData.testDetails.name,
        summaryDataRows: pdfData.summaryData?.rows?.length || 0,
        insightsKeys: Object.keys(pdfData.insights),
        competitiveInsightsCount: pdfData.competitiveinsights?.summaryData?.length || 0,
        averageSurveysCount: pdfData.averagesurveys?.summaryData?.length || 0,
        shopperCommentsCount: pdfData.insights?.shopper_comments?.length || 0,
        shopperCommentsSummary: !!pdfData.insights?.shopper_comments_summary,
        hasComparisons: !!pdfData.testDetails.responses?.comparisons,
        hasSurveys: !!pdfData.testDetails.responses?.surveys,
        orientation: selectedOrientation,
      });

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

      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(
        'Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido')
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    // No limpiar la URL inmediatamente para permitir re-apertura
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
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled
        >
          <FileSpreadsheet size={20} />
          Export to Excel
        </button>
        <button
          disabled={loadingInsights}
          onClick={handleRegenerateInsights}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <RefreshCcw size={20} />
          {loadingInsights ? 'Regenerating Insights...' : 'Regenerate Insights'}
        </button>

        {/* Dropdown para Export to PDF */}
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

      {/* Cerrar menú al hacer click fuera */}
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

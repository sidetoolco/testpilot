import React, { useState } from 'react';
import { FileSpreadsheet, File as FilePdf, X, RefreshCcw } from 'lucide-react';
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
}: {
  testDetails: PDFDocumentProps['testDetails'];
  summaryData: PDFDocumentProps['summaryData'];
  insights: PDFDocumentProps['insights'];
  competitiveinsights: PDFDocumentProps['competitiveinsights'];
  averagesurveys: PDFDocumentProps['averagesurveys'];
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
    competitive_insights: ''
  };

  const safeCompetitiveInsights = competitiveinsights || { summaryData: [] };
  const safeAveragesurveys = averagesurveys || { summaryData: [] };

  return (
    <Document>
      <CoverPageSection testDetails={testDetails} variantsArray={variantsArray} />
      <TestDetailsPDFSection testDetails={testDetails} />
      <SummaryPDFSection summaryData={summaryData} insights={safeInsights} />

      {Object.entries(testDetails.variations || {}).map(
        ([key, variation]) =>
          variation && (
            <React.Fragment key={key}>
              <VariantCover
                variantKey={key}
                title={variation.title}
                imageUrl={variation.image_url}
              />
              <PurchaseDriversPDFSection
                insights={safeInsights?.purchase_drivers}
                averagesurveys={safeAveragesurveys.summaryData?.find(
                  (item: any) => item.variant_type === key
                )}
              />
              <CompetitiveInsightsPDFSection
                competitiveinsights={safeCompetitiveInsights.summaryData?.filter(
                  (item: any) => item.variant_type === key
                ) || []}
                insights={safeInsights?.competitive_insights}
              />
            </React.Fragment>
          )
      )}
      {/* <Page size="A4" orientation="portrait" style={styles.page}>
                <Image
                    src={logo}
                    style={styles.logo}
                />
                <ShopperCommentsPDFSection />
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} />
            </Page> */}
      {safeInsights?.recommendations && (
        <RecommendationsPDFSection insights={safeInsights.recommendations} />
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

  const isTestActiveOrComplete = testDetails?.status === 'active' || testDetails?.status === 'complete';

  const handleExportPDF = async () => {
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
        averagesurveys: !!averagesurveys
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
        insights: insights ? JSON.parse(JSON.stringify(insights)) : {
          purchase_drivers: '',
          recommendations: '',
          competitive_insights: ''
        },
        competitiveinsights: competitiveinsights ? JSON.parse(JSON.stringify(competitiveinsights)) : {
          summaryData: []
        },
        averagesurveys: averagesurveys ? JSON.parse(JSON.stringify(averagesurveys)) : {
          summaryData: []
        }
      };

      console.log('Generating PDF with data:', {
        testDetailsName: pdfData.testDetails.name,
        summaryDataRows: pdfData.summaryData?.rows?.length || 0,
        insightsKeys: Object.keys(pdfData.insights),
        competitiveInsightsCount: pdfData.competitiveinsights?.summaryData?.length || 0,
        averageSurveysCount: pdfData.averagesurveys?.summaryData?.length || 0
      });

      const blob = await pdf(
        <PDFDocument
          testDetails={pdfData.testDetails}
          summaryData={pdfData.summaryData}
          insights={pdfData.insights}
          competitiveinsights={pdfData.competitiveinsights}
          averagesurveys={pdfData.averagesurveys}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setIsPreviewOpen(true);
      
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
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
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!isTestActiveOrComplete || isGenerating}
        >
          <FilePdf size={20} />
          {isGenerating ? 'Generating PDF...' : 'Export to PDF'}
        </button>
      </div>

      {isPreviewOpen && pdfUrl && (
        <PDFPreviewModal isOpen={isPreviewOpen} onClose={handleClosePreview} pdfUrl={pdfUrl} />
      )}
    </>
  );
};

export default ReportPDF;

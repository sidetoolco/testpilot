import React, { useState } from 'react';
import { FileSpreadsheet, File as FilePdf, X } from 'lucide-react';
import { Document, pdf } from '@react-pdf/renderer';
import { TestDetailsPDFSection } from './pdf-sections/TestDetailsPDFSection';
import { SummaryPDFSection } from './pdf-sections/SummaryPDFSection';
import { PurchaseDriversPDFSection } from './pdf-sections/PurchaseDriversPDFSection';
import { CompetitiveInsightsPDFSection } from './pdf-sections/CompetitiveInsightsPDFSection';
import { RecommendationsPDFSection } from './pdf-sections/RecommendationsPDFSection';
import { CoverPageSection } from './pdf-sections/CoverPageSection';
import { TestDetails } from './utils/types';
import { VariantCover } from './sections/VariantCover';

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
    disabled?: boolean;
}

const PDFDocument = ({ testDetails, summaryData, insights, competitiveinsights }: {
    testDetails: PDFDocumentProps['testDetails'];
    summaryData: PDFDocumentProps['summaryData'];
    insights: PDFDocumentProps['insights'];
    competitiveinsights: PDFDocumentProps['competitiveinsights'];
}) => {
    if (!testDetails || !summaryData) {
        return null;
    }

    const variantsArray = [testDetails.variations.a, testDetails.variations.b, testDetails.variations.c].filter(v => v);

    return (
        <Document>
            <CoverPageSection testDetails={testDetails} variantsArray={variantsArray} />
            <TestDetailsPDFSection testDetails={testDetails} />
            <SummaryPDFSection summaryData={summaryData} />

            {Object.entries(testDetails.variations).map(([key, variation]) =>
                variation && (
                    <React.Fragment key={key}>
                        <VariantCover
                            variantKey={key}
                            title={variation.title}
                            imageUrl={variation.image_url}
                        />
                        <PurchaseDriversPDFSection
                            testDetails={testDetails}
                            variationType={key}
                            insights={insights?.purchase_drivers}
                        />
                        <CompetitiveInsightsPDFSection
                            competitiveinsights={competitiveinsights[key]}
                            insights={insights?.competitive_insights}
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
            {insights?.recommendations && (
                <RecommendationsPDFSection insights={insights.recommendations} />
            )}
        </Document>
    );
};

const PDFPreviewModal = ({ isOpen, onClose, pdfUrl }: { isOpen: boolean; onClose: () => void; pdfUrl: string }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">PDF Preview</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="PDF Preview"
                    />
                </div>
            </div>
        </div>
    );
};

export const ReportPDF: React.FC<PDFDocumentProps> = ({
    testDetails,
    summaryData,
    insights,
    competitiveinsights,
    disabled
}) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleExportPDF = async () => {
        try {
            if (!testDetails || !summaryData || !competitiveinsights || !insights) {
                console.error('Missing required data for PDF generation');
                return;
            }

            const blob = await pdf(
                <PDFDocument
                    testDetails={testDetails}
                    summaryData={summaryData}
                    insights={insights}
                    competitiveinsights={competitiveinsights}
                />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
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
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={disabled || !testDetails || !summaryData}
                >
                    <FilePdf size={20} />
                    Export to PDF
                </button>
            </div>

            {isPreviewOpen && pdfUrl && (
                <PDFPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={handleClosePreview}
                    pdfUrl={pdfUrl}
                />
            )}
        </>
    );
};

export default ReportPDF; 
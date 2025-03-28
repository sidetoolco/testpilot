import React, { useState } from 'react';
import { FileSpreadsheet, File as FilePdf, X } from 'lucide-react';
import { Document, Page, Text, Image, pdf, View } from '@react-pdf/renderer';
import { styles } from './utils/styles';
import { ReportPDFProps } from './utils/types';
import { TestDetailsPDFSection } from './pdf-sections/TestDetailsPDFSection';
import { SummaryPDFSection } from './pdf-sections/SummaryPDFSection';
import { PurchaseDriversPDFSection } from './pdf-sections/PurchaseDriversPDFSection';
import { CompetitiveInsightsPDFSection } from './pdf-sections/CompetitiveInsightsPDFSection';
import { ShopperCommentsPDFSection } from './pdf-sections/ShopperCommentsPDFSection';
import { RecommendationsPDFSection } from './pdf-sections/RecommendationsPDFSection';
import { CoverPageSection } from './pdf-sections/CoverPageSection';
import logo from './utils/testpilot-logo.png';

const PDFDocument = ({ testDetails }: { testDetails: ReportPDFProps['testDetails'] }) => {
    const variantsArray = [testDetails.variations.a, testDetails.variations.b, testDetails.variations.c].filter(v => v);

    return (
        <Document>
            <CoverPageSection testDetails={testDetails} variantsArray={variantsArray} />
            <TestDetailsPDFSection testDetails={testDetails} />
            <Page size="A4" orientation="portrait" style={styles.page}>
                <Image src={logo} style={styles.logo} />
                <SummaryPDFSection />
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} />
            </Page>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <Image
                    src={logo}
                    style={styles.logo}
                />
                <PurchaseDriversPDFSection testDetails={testDetails} />
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} />
            </Page>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <Image
                    src={logo}
                    style={styles.logo}
                />
                <CompetitiveInsightsPDFSection />
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} />
            </Page>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <Image
                    src={logo}
                    style={styles.logo}
                />
                <ShopperCommentsPDFSection />
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} />
            </Page>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <Image src={logo} style={styles.logo} />
                <RecommendationsPDFSection />
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} />
            </Page>
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

const ReportPDF: React.FC<ReportPDFProps> = ({ onPrintStart, onPrintEnd, testDetails, disabled }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleExportPDF = async () => {
        onPrintStart();
        try {
            const blob = await pdf(<PDFDocument testDetails={testDetails} />).toBlob();
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            onPrintEnd();
        }
    };

    const handleDownload = () => {
        if (previewUrl) {
            const link = document.createElement('a');
            link.href = previewUrl;
            link.download = 'test-report.pdf';
            link.click();
        }
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
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
                    disabled={disabled}
                >
                    <FilePdf size={20} />
                    Export to PDF
                </button>
            </div>

            {isPreviewOpen && previewUrl && (
                <PDFPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={handleClosePreview}
                    pdfUrl={previewUrl}
                />
            )}
        </>
    );
};

export default ReportPDF; 
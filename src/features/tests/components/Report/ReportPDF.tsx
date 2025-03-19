import React from 'react';
import { FileSpreadsheet, File as FilePdf } from 'lucide-react';
import { Document, Page, Text, Image, pdf, View } from '@react-pdf/renderer';
import { styles } from './utils/styles';
import { ReportPDFProps } from './utils/types';
import { TestDetailsPDFSection } from './pdf-sections/TestDetailsPDFSection';
import { SummaryPDFSection } from './pdf-sections/SummaryPDFSection';
import { PurchaseDriversPDFSection } from './pdf-sections/PurchaseDriversPDFSection';
import { CompetitiveInsightsPDFSection } from './pdf-sections/CompetitiveInsightsPDFSection';
import { ShopperCommentsPDFSection } from './pdf-sections/ShopperCommentsPDFSection';
import { RecommendationsPDFSection } from './pdf-sections/RecommendationsPDFSection';
import logo from './utils/testpilot-logo.png';

// PDF Document Component
const PDFDocument = ({ testDetails }: { testDetails: ReportPDFProps['testDetails'] }) => {
    return (
        <Document>
            <Page size="A4" orientation="portrait" style={{ ...styles.page, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Image
                    src={logo}
                    style={styles.coverLogo}
                />
                <View style={{ color: 'white', backgroundColor: 'black', padding: 10, borderRadius: 10 }}>
                    <Text style={styles.title}>Saint Rocco's Amazon Test #1</Text>
                    <Text style={styles.subtitle}>2 Tested Variants, 11 Competitors</Text>
                    <Text style={styles.date}>March 2, 2025</Text>
                </View>
                <Text style={styles.disclaimer}>
                    TestPilot provides insights based on real shopper behavior in realistic eCommerce environments, helping you to make faster and more informed decisions. Actual market results may vary due to factors like competition, economic shifts, and retail dynamics. While our testing reduces risk, TestPilot makes no guarantees of real-world success. Final decisions rest with you.
                </Text>
            </Page>

            <Page size="A4" orientation="portrait" style={styles.page}>
                <Image
                    src={logo}
                    style={styles.logo}
                />
                <TestDetailsPDFSection testDetails={testDetails} />
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} />
            </Page>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <Image
                    src={logo}
                    style={styles.logo}
                />
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
                <Image
                    src={logo}
                    style={styles.logo}
                />
                <RecommendationsPDFSection />
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} />
            </Page>
        </Document>
    );
};

const ReportPDF: React.FC<ReportPDFProps> = ({ onPrintStart, onPrintEnd, testDetails }) => {
    const handleExportPDF = async () => {
        onPrintStart();
        try {
            const blob = await pdf(<PDFDocument testDetails={testDetails} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'test-report.pdf';
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            onPrintEnd();
        }
    };

    return (
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
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
                <FilePdf size={20} />
                Export to PDF
            </button>
        </div>
    );
};

export default ReportPDF; 
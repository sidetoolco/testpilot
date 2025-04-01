import React from 'react';
import { View, Text, Page } from '@react-pdf/renderer';
import { Header } from './Header';
import { MarkdownText } from '../utils/MarkdownText';
import { styles } from '../utils/styles';

interface Competitor {
    title: string;
    count: number;
    shopper_count: number;
    value: number;
    appearance: number;
    convenience: number;
    brand: number;
    confidence: number;
    share: number;
}

interface CompetitiveInsightsPDFSectionProps {
    competitiveinsights: Competitor[];
    insights?: string;
}

// Constants for styling
const TABLE_STYLES = {
    container: {
        marginTop: 16,
        borderRadius: 4,
        border: '1px solid #E0E0E0',
        width: '100%',
    },
    header: {
        flexDirection: 'row' as const,
        backgroundColor: '#F5F5F5',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        width: '100%',
    },
    headerCellFirst: {
        width: '30%',
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'flex-start' as const,
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
        paddingLeft: 8,
        paddingVertical: 8,
    },
    headerCell: {
        width: '11.6%',
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
        paddingVertical: 8,
    },
    headerCellLast: {
        width: '11.6%',
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 8,
    },
    headerText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#374151',
        textAlign: 'center' as const,
    },
    row: {
        flexDirection: 'row' as const,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        width: '100%',
    },
    lastRow: {
        flexDirection: 'row' as const,
        width: '100%',
    },
    productCell: {
        width: '30%',
        fontSize: 11,
        textAlign: 'left' as const,
        padding: '8px',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    metricCell: {
        width: '11.6%',
        fontSize: 11,
        textAlign: 'center' as const,
        padding: '8px 4px',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    metricCellLast: {
        width: '11.6%',
        fontSize: 11,
        textAlign: 'center' as const,
        padding: '8px 4px',
    },
    averageMetricsContainer: {
        marginTop: 24,
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 4,
        border: '1px solid #E0E0E0',
    },
    averageMetricsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    averageMetricsRow: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        flexWrap: 'wrap' as const,
        gap: 16,
    },
    averageMetricItem: {
        fontSize: 11,
        color: '#374151',
    },
    pageHeader: {
        marginBottom: 24,
        padding: '0 30px',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 16,
    },
    footer: {
        borderTop: '1px solid #E0E0E0',
        paddingTop: 20,
        display: 'flex' as const,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        marginTop: 24,
    },
    tableTitle: {
        fontSize: 12,
        color: '#374151',
        padding: '8px 12px',
        backgroundColor: '#F9FAFB',
        borderBottom: '1px solid #E0E0E0',
        textAlign: 'right' as const,
        paddingRight: 100,
    },
};

const truncateTitle = (title: string, maxLength: number = 25): string => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
};

const getColorStyle = (value: number) => {
    if (value > 3) return { backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 8px' }; // green
    if (value < 3) return { backgroundColor: '#FEE2E2', color: '#991B1B', padding: '4px 8px' }; // red
    return { backgroundColor: '#FEF9C3', color: '#854D0E', padding: '4px 8px' }; // yellow
};

const calculateAverageMetrics = (competitors: Competitor[]) => {
    if (!competitors.length) return null;

    const sum = competitors.reduce((acc, curr) => ({
        value: acc.value + curr.value,
        appearance: acc.appearance + curr.appearance,
        convenience: acc.convenience + curr.convenience,
        brand: acc.brand + curr.brand,
        confidence: acc.confidence + curr.confidence,
    }), { value: 0, appearance: 0, convenience: 0, brand: 0, confidence: 0 });

    return {
        value: sum.value / competitors.length,
        appearance: sum.appearance / competitors.length,
        convenience: sum.convenience / competitors.length,
        brand: sum.brand / competitors.length,
        confidence: sum.confidence / competitors.length,
    };
};

export const CompetitiveInsightsPDFSection: React.FC<CompetitiveInsightsPDFSectionProps> = ({ competitiveinsights, insights }) => {
    if (!competitiveinsights?.length) {
        return (
            <Page size="A4" orientation="portrait" style={{ padding: 30, backgroundColor: '#fff' }}>
                <View style={styles.section}>
                    <Header title="Competitive Insights" />
                    <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
                        No competitive insights data available
                    </Text>
                </View>
                <View style={{ borderTop: '1px solid #000000', paddingTop: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>
                        testpilot.com
                    </Text>
                    <Text style={styles.pageNumber} render={({ pageNumber }: { pageNumber: number; }) => `${pageNumber}`} />
                </View>
            </Page>
        );
    }

    const averageMetrics = calculateAverageMetrics(competitiveinsights);

    return (
        <>
            <Page size="A4" orientation="portrait" >
                <View style={styles.section}>
                    <View style={TABLE_STYLES.pageHeader}>
                        <Header title="Competitive Insights" />
                        <MarkdownText text={insights || ''} />
                    </View>
                </View>
                <View style={{ borderTop: '1px solid #000000', paddingTop: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>
                        testpilot.com
                    </Text>
                    <Text style={styles.pageNumber} render={({ pageNumber }: { pageNumber: number; }) => `${pageNumber}`} />
                </View>
            </Page>
            <Page size="A4" orientation="portrait">
                <Header title="Competitive Insights" />
                <View style={styles.section}>
                    {averageMetrics && (
                        <View style={TABLE_STYLES.averageMetricsContainer}>
                            <Text style={TABLE_STYLES.averageMetricsTitle}>Average metrics your product vs the competitors</Text>
                            <View style={TABLE_STYLES.averageMetricsRow}>
                                <Text style={TABLE_STYLES.averageMetricItem}>Value: {averageMetrics.value.toFixed(1)}</Text>
                                <Text style={TABLE_STYLES.averageMetricItem}>Appearance: {averageMetrics.appearance.toFixed(1)}</Text>
                                <Text style={TABLE_STYLES.averageMetricItem}>Convenience: {averageMetrics.convenience.toFixed(1)}</Text>
                                <Text style={TABLE_STYLES.averageMetricItem}>Brand: {averageMetrics.brand.toFixed(1)}</Text>
                                <Text style={TABLE_STYLES.averageMetricItem}>Confidence: {averageMetrics.confidence.toFixed(1)}</Text>
                            </View>
                        </View>
                    )}
                    <View style={TABLE_STYLES.container}>
                        <Text style={TABLE_STYLES.tableTitle}>Your Item vs Competitor</Text>
                        <View style={TABLE_STYLES.header}>
                            <View style={TABLE_STYLES.headerCellFirst}>
                                <Text style={TABLE_STYLES.headerText}>Competitor</Text>
                            </View>
                            <View style={TABLE_STYLES.headerCell}>
                                <Text style={TABLE_STYLES.headerText}>Share</Text>
                            </View>
                            <View style={TABLE_STYLES.headerCell}>
                                <Text style={TABLE_STYLES.headerText}>Value</Text>
                            </View>
                            <View style={TABLE_STYLES.headerCell}>
                                <Text style={TABLE_STYLES.headerText}>{'Appear-\nance'}</Text>
                            </View>
                            <View style={TABLE_STYLES.headerCell}>
                                <Text style={TABLE_STYLES.headerText}>{'Conve-\nnience'}</Text>
                            </View>
                            <View style={TABLE_STYLES.headerCell}>
                                <Text style={TABLE_STYLES.headerText}>Brand</Text>
                            </View>
                            <View style={TABLE_STYLES.headerCellLast}>
                                <Text style={TABLE_STYLES.headerText}>{'Confi-\ndence'}</Text>
                            </View>
                        </View>
                        {competitiveinsights.map((competitor, index) => (
                            <View key={index} style={index === competitiveinsights.length - 1 ? TABLE_STYLES.lastRow : TABLE_STYLES.row}>
                                <Text style={TABLE_STYLES.productCell}>{truncateTitle(competitor.title)}</Text>
                                <Text style={TABLE_STYLES.metricCell}>{competitor.share.toFixed(1)}%</Text>
                                <Text style={{ ...TABLE_STYLES.metricCell, ...getColorStyle(competitor.value) }}>{competitor.value.toFixed(1)}</Text>
                                <Text style={{ ...TABLE_STYLES.metricCell, ...getColorStyle(competitor.appearance) }}>{competitor.appearance.toFixed(1)}</Text>
                                <Text style={{ ...TABLE_STYLES.metricCell, ...getColorStyle(competitor.convenience) }}>{competitor.convenience.toFixed(1)}</Text>
                                <Text style={{ ...TABLE_STYLES.metricCell, ...getColorStyle(competitor.brand) }}>{competitor.brand.toFixed(1)}</Text>
                                <Text style={{ ...TABLE_STYLES.metricCellLast, ...getColorStyle(competitor.confidence) }}>{competitor.confidence.toFixed(1)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View style={{ borderTop: '1px solid #000000', paddingTop: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>
                        testpilot.com
                    </Text>
                    <Text style={styles.pageNumber} render={({ pageNumber }: { pageNumber: number; }) => `${pageNumber}`} />
                </View>
            </Page>
        </>
    );
}; 
import React from 'react';
import { View, Text, Page } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { TestDetails, DatasetType } from '../utils/types';
import { Header } from './Header';
import { MarkdownText } from '../utils/MarkdownText';

const LABELS = ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'] as const;
const COLORS = ["#34A270", "#075532", "#E0D30D"] as const;

interface Survey {
    value: number;
    appearance: number;
    confidence: number;
    brand: number;
    convenience: number;
}

interface PurchaseDriversPDFSectionProps {
    testDetails: TestDetails;
    insights?: string;
}

const InsufficientDataMessage: React.FC<{ variantCount?: number }> = ({ variantCount }) => (
    <View style={{
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        padding: 16,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    }}>
        <View style={{
            width: 24,
            height: 24,
            backgroundColor: '#FEE2E2',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Text style={{ color: '#DC2626', fontSize: 16 }}>!</Text>
        </View>
        <View>
            <Text style={{ color: '#991B1B', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                Insufficient Data
            </Text>
            <Text style={{ color: '#7F1D1D', fontSize: 12 }}>
                {variantCount && variantCount > 0
                    ? `No shoppers selected any of the ${variantCount} variants.`
                    : 'No data available for this test.'}
            </Text>
        </View>
    </View>
);

const calculateAverageRatings = (surveys: Survey[]): number[] => {
    if (!surveys.length) return [0, 0, 0, 0, 0];

    const total = surveys.length;
    return [
        surveys.reduce((sum, survey) => sum + (survey.value || 0), 0) / total,
        surveys.reduce((sum, survey) => sum + (survey.appearance || 0), 0) / total,
        surveys.reduce((sum, survey) => sum + (survey.confidence || 0), 0) / total,
        surveys.reduce((sum, survey) => sum + (survey.brand || 0), 0) / total,
        surveys.reduce((sum, survey) => sum + (survey.convenience || 0), 0) / total
    ].map(val => Number(val.toFixed(2)));
};

const getChartData = (testDetails: TestDetails): DatasetType[] => {
    if (!testDetails?.responses?.surveys) return [];

    return Object.entries(testDetails?.responses?.surveys)
        .map(([variant, surveys]) => {
            if (!surveys || surveys.length === 0) return null;

            const avgRatings = calculateAverageRatings(surveys);
            const colorIndex = Object.keys(testDetails.responses.surveys).indexOf(variant);

            return {
                label: `Variant ${variant.toUpperCase()}`,
                data: avgRatings,
                color: COLORS[colorIndex % COLORS.length] as string,
            };
        })
        .filter((dataset): dataset is DatasetType => dataset !== null);
};

const Footer: React.FC = () => (
    <View style={{ borderTop: '1px solid #000000', paddingTop: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>
            testpilot.com
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber }: { pageNumber: number; }) => `${pageNumber}`} />
    </View>
);

export const PurchaseDriversPDFSection: React.FC<PurchaseDriversPDFSectionProps> = ({ testDetails, insights }) => {
    const datasets = getChartData(testDetails);
    const variantCount = Object.keys(testDetails?.responses?.surveys || {}).length;

    if (!testDetails?.responses?.surveys || variantCount === 0) {
        return (
            <Page key="drivers" size="A4" orientation="portrait" style={styles.page}>
                <Header title="Purchase Drivers" />
                <View style={styles.section}>
                    <InsufficientDataMessage variantCount={variantCount} />
                </View>
                <Footer />
            </Page>
        );
    }

    if (datasets.length === 0) {
        return (
            <Page key="drivers" size="A4" orientation="portrait" style={styles.page}>
                <Header title="Purchase Drivers" />
                <View style={styles.section}>
                    <InsufficientDataMessage variantCount={variantCount} />
                </View>
                <Footer />
            </Page>
        );
    }

    return (
        <Page key="drivers" size="A4" orientation="portrait" style={styles.page}>
            <View style={styles.section}>
                <Header title="Purchase Drivers" />
                <MarkdownText text={insights} />
                <View style={styles.section}>
                    <View style={styles.chartContainer}>
                        {/* Legend */}
                        <View style={styles.chartLegend}>
                            {datasets.map((dataset, i) => (
                                <View key={i} style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: dataset.color }]} />
                                    <Text style={styles.legendText}>{dataset.label}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Chart */}
                        <View style={styles.chartGrid}>
                            {/* Y Axis */}
                            <View style={styles.yAxis}>
                                {[5, 4, 3, 2, 1, 0].map((value) => (
                                    <Text key={value} style={[styles.yAxisLabel, { bottom: `${value * 20}%` }]}>
                                        {value}
                                    </Text>
                                ))}
                            </View>

                            {/* Bars */}
                            <View style={{ flexDirection: 'row', flex: 1, marginLeft: 35, justifyContent: 'space-between' }}>
                                {LABELS.map((label, labelIndex) => (
                                    <View key={label} style={[styles.barGroup, { width: '18%' }]}>
                                        {datasets.map((dataset, datasetIndex) => {
                                            const value = dataset.data[labelIndex];
                                            const height = `${(value / 5) * 100}%`;
                                            return (
                                                <View key={datasetIndex} style={[styles.bar, { height, backgroundColor: dataset.color }]}>
                                                    <Text style={styles.barValue}>{value}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* X Axis Labels */}
                        <View style={[styles.xAxis, { paddingHorizontal: '2%' }]}>
                            {LABELS.map((label) => (
                                <View key={label} style={{ width: '18%', alignItems: 'center' }}>
                                    <Text style={styles.xAxisLabel}>{label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
            <Footer />
        </Page>
    );
};
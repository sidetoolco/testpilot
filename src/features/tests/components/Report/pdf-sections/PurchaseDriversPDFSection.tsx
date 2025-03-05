import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { TestDetails, DatasetType } from '../utils/types';

const LABELS = ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'];
const COLORS = ["#34A270", "#075532", "#E0D30D"];

interface PurchaseDriversPDFSectionProps {
    testDetails: TestDetails;
}

export const PurchaseDriversPDFSection: React.FC<PurchaseDriversPDFSectionProps> = ({ testDetails }) => {
    if (!testDetails?.responses?.surveys || Object.keys(testDetails.responses.surveys).length === 0) return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purchase Drivers</Text>
            <Text style={styles.text}>No survey data available</Text>
        </View>
    );

    const datasets: DatasetType[] = Object.entries(testDetails.responses.surveys)
        .map(([variationType, surveys]) => {
            if (!Array.isArray(surveys) || surveys.length === 0) return null;

            const total = surveys.length;
            const avgRatings = surveys.reduce(
                (acc, survey) => {
                    if (survey) {
                        acc[0] += survey.value || 0;
                        acc[1] += survey.appearance || 0;
                        acc[2] += survey.confidence || 0;
                        acc[3] += survey.brand || 0;
                        acc[4] += survey.convenience || 0;
                    }
                    return acc;
                },
                [0, 0, 0, 0, 0]
            ).map(val => Number((val / total).toFixed(2)));

            return {
                label: `Variant ${variationType.toUpperCase()}`,
                data: avgRatings,
                color: COLORS[Object.keys(testDetails.responses.surveys).indexOf(variationType) % COLORS.length],
            };
        })
        .filter((dataset): dataset is DatasetType => dataset !== null);

    if (datasets.length === 0) {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Purchase Drivers</Text>
                <Text style={styles.text}>No valid survey data available</Text>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purchase Drivers</Text>
            <Text style={styles.text}>Analysis of factors influencing purchase decisions</Text>

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
    );
}; 
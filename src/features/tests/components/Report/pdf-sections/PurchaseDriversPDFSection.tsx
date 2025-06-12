import React from 'react';
import { View, Text, Page } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';
import { MarkdownText } from '../utils/MarkdownText';

const LABELS = ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'] as const;
const COLORS = ['#34A270', '#075532', '#E0D30D'] as const;

interface Survey {
  id: number;
  created_at: string;
  appearance: number;
  confidence: number;
  convenience: number;
  brand: number;
  value: number;
  test_id: string;
  variant_type: string;
  count: number;
  product_id: string;
  product: {
    title: string;
  };
}

interface Dataset {
  label: string;
  color: string;
  data: number[];
}

interface PurchaseDriversPDFSectionProps {
  insights?: string;
  averagesurveys: Survey;
}

const getChartData = (survey: Survey): Dataset[] => {
  if (!survey) {
    return [];
  }

  const data = [
    survey.appearance,
    survey.value,
    survey.confidence,
    survey.brand,
    survey.convenience,
  ];

  return [
    {
      label: 'Average Score',
      color: COLORS[0],
      data: data,
    },
  ];
};

const InsufficientDataMessage: React.FC<{ variantCount?: number }> = ({ variantCount }) => (
  <View
    style={{
      backgroundColor: '#FEF2F2',
      borderRadius: 8,
      padding: 16,
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    }}
  >
    <View
      style={{
        width: 24,
        height: 24,
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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

const Footer: React.FC = () => (
  <View
    style={{
      borderTop: '1px solid #000000',
      paddingTop: 20,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>testpilot.com</Text>
    <Text
      style={styles.pageNumber}
      render={({ pageNumber }: { pageNumber: number }) => `${pageNumber}`}
    />
  </View>
);

export const PurchaseDriversPDFSection: React.FC<PurchaseDriversPDFSectionProps> = ({
  insights,
  averagesurveys,
}) => {
  const datasets = getChartData(averagesurveys);

  if (!averagesurveys) {
    return (
      <Page key="drivers" size="A4" orientation="portrait" style={styles.page}>
        <Header title="Purchase Drivers" />
        <View style={styles.section}>
          <InsufficientDataMessage />
        </View>
        <Footer />
      </Page>
    );
  }

  return (
    <Page key="drivers" size="A4" orientation="portrait" style={styles.page}>
      <View style={styles.section}>
        <Header title="Purchase Drivers" />
        <View style={styles.section}>
          <View style={styles.chartContainer}>
            {/* Legend */}
            <View style={styles.chartLegend}>
              {datasets.map((dataset: Dataset, i: number) => (
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
                {[5, 4, 3, 2, 1, 0].map(value => (
                  <Text key={value} style={[styles.yAxisLabel, { bottom: `${value * 20}%` }]}>
                    {value}
                  </Text>
                ))}
              </View>

              {/* Bars */}
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  marginLeft: 35,
                  justifyContent: 'space-between',
                }}
              >
                {LABELS.map((label, labelIndex) => (
                  <View key={label} style={[styles.barGroup, { width: '18%' }]}>
                    {datasets.map((dataset: Dataset, datasetIndex: number) => {
                      const value = dataset.data[labelIndex];
                      const height = `${(value / 5) * 100}%`;
                      return (
                        <View
                          key={datasetIndex}
                          style={[styles.bar, { height, backgroundColor: dataset.color }]}
                        >
                          <Text style={styles.barValue}>{value.toFixed(1)}</Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* X Axis Labels */}
            <View style={[styles.xAxis, { paddingHorizontal: '2%' }]}>
              {LABELS.map(label => (
                <View key={label} style={{ width: '18%', alignItems: 'center' }}>
                  <Text style={styles.xAxisLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Insights text in a separate section */}
        {insights && (
          <View style={{ marginTop: 20 }}>
            <MarkdownText text={insights} />
          </View>
        )}
      </View>
      <Footer />
    </Page>
  );
};

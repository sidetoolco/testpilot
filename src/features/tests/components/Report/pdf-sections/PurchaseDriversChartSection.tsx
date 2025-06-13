import React from 'react';
import { View, Text, Page } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';

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

interface PurchaseDriversChartSectionProps {
  variantKey: string;
  variantTitle: string;
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

export const PurchaseDriversChartSection: React.FC<PurchaseDriversChartSectionProps> = ({
  variantKey,
  variantTitle,
  averagesurveys,
}) => {
  const datasets = getChartData(averagesurveys);

  if (!averagesurveys) {
    return null;
  }

  return (
    <Page size="A4" orientation="portrait" style={styles.page}>
      <View style={styles.section}>
        <Header title={`Purchase Drivers - Variant ${variantKey.toUpperCase()}`} />
        
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
      </View>
      <Footer />
    </Page>
  );
}; 